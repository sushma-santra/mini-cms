const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE = 0.5; // Minimum score to consider the interaction legitimate

export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    throw new Error('RECAPTCHA_SECRET_KEY is not configured');
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

    if (data.success && data.score !== undefined) {
      return data.score >= MIN_SCORE;
    }

    return false;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
} 