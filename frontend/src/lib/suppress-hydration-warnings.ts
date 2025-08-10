/**
* Suppress hydration warnings in development
* This is specifically for browser extension interference
*/
exportfunctionsuppressHydrationWarnings() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      
      // Suppress hydration mismatch warnings caused by browser extensions
      if (
        typeof message === 'string' &&
        (message.includes('A tree hydrated but some attributes of the server rendered HTML') ||
         message.includes('data-windsurf-page-id') ||
         message.includes('data-windsurf-extension-id') ||
         message.includes('hydration-mismatch'))
      ) {
        return;
      }
      
      originalError.apply(console, args);
    };
  }
}
