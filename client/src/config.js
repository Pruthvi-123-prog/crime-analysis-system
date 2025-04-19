const config = {
  // For GitHub Pages, we need to point to your backend GitHub repo
  apiBaseUrl: process.env.NODE_ENV === 'production'
    ? 'https://raw.githubusercontent.com/pruthvi-123-prog/crime-analysis-system/main/server'
    : 'http://localhost:5000/api'
};

export default config;