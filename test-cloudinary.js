const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'mwnpilt4',
  api_key: '219797932124792',
  api_secret: 'DA4zApgAProGZgDWEPgPFbo1Hb8',
  secure: true,
});

async function testUpload() {
  try {
    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp };
    
    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      'DA4zApgAProGZgDWEPgPFbo1Hb8'
    );
    
    console.log('Signature generated:', signature);
    
    // Create a dummy image
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const formData = new FormData();
    formData.append('file', 'undefined');
    formData.append('api_key', '219797932124792');
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/mwnpilt4/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const text = await res.text();
    console.log('Upload response status:', res.status);
    console.log('Upload response text:', text);
  } catch (err) {
    console.error('Script Error:', err);
  }
}

testUpload();
