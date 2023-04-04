import axios, { AxiosResponse } from 'axios';
import tracer from 'dd-trace';
const websites = ['https://google.com', 'https://bing.com', 'https://yahoo.com'];

const checkStatusCode = async (url: string): Promise<number> => {
  try {
    const response: AxiosResponse = await axios.head(url);
    return response.status;
  } catch (error: any) {
    if (error.response) {
      return error.response.status;
    }
    throw error;
  }
};

describe('HTTP concurrent check', () => {
  test.concurrent.each(websites)('Concurrent Request to %s', async (url) => {
    const span = tracer.scope().active();
    const statusCode = await checkStatusCode(url);
    expect(statusCode).toBe(200);
    if (!span) {
      console.warn("CONCURRENT No active span found, can't set tag");
    } else {
      span.setTag('website', url);
    }
  });
});

describe('HTTP single thread check', () => {
    websites.forEach((url) => {
      test(`Single Request to ${url}`, async () => {
        const statusCode = await checkStatusCode(url);
        expect(statusCode).toBe(200);
        const span = tracer.scope().active();
        if (!span) {
          console.warn("SINGLE No active span found, can't set tag");
        } else {
          span.setTag('website', url);
        }
      })
    });
});

