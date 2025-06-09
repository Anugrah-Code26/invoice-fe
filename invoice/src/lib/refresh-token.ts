export async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.refreshToken}`,
      },
    });

    const data = await response.json();
    console.log("Refresh Data: ", data);
    

    if (!response.ok) throw new Error('Failed to refresh token');

    return {
      ...token,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken
    };
  } catch (error) {
    console.error('Error refreshing token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
