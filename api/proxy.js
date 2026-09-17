export default async function handler(req, res) {
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbxEhpewNP0z_3dPdpQX9BLbwpYasg5ZE55xv_y2Da7zOImwGF_Zsa2jK83wHKfJHhcd/exec';

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow',
    });

    const text = await response.text();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send('error');
  }
}
