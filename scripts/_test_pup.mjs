import puppeteer from 'puppeteer';
console.log('exec:', puppeteer.executablePath());
try {
  const b = await puppeteer.launch({headless:true, args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage']});
  console.log('launched ok');
  await b.close();
} catch(e) { console.log('launch err:', e.message); }
