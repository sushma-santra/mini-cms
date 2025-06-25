const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE = 0.5; // Minimum score to consider the interaction legitimate
const SKIP_RECAPTCHA = process.env.NODE_ENV === 'development' || process.env.SKIP_RECAPTCHA === 'true';

export async function verifyRecaptcha(token: string): Promise<boolean> {
  // Skip verification in development or if explicitly disabled
  // if (SKIP_RECAPTCHA) {
  //   console.warn('⚠️ reCAPTCHA verification is disabled');
  //   return true;
  // }

  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('⚠️ RECAPTCHA_SECRET_KEY is not configured');
    return process.env.NODE_ENV === 'development'; // Allow in dev, fail in prod
  }

  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    });

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await response.json();

    // Support both v2 and v3 tokens
    if (data.success) {
      // For v3, check score
      if (data.score !== undefined) {
        return data.score >= MIN_SCORE;
      }
      // For v2, success is enough
      return true;
    }

    console.error('reCAPTCHA verification failed:', data);
    return false;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
} 