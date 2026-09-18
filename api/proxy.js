// Настраиваем Vercel на автоматический парсинг JSON из тела запроса
export const config = {
  api: {
    bodyParser: true,
  },
};

// КОНФИГУРАЦИЯ: Связка ID группы ВКонтакте и URL Google Apps Script
// Добавляйте сюда новые строки для каждого нового бота
const BOT_ROUTES = {
  "237389652": "https://script.google.com/macros/s/AKfycbxEhpewNP0z_3dPdpQX9BLbwpYasg5ZE55xv_y2Da7zOImwGF_Zsa2jK83wHKfJHhcd/exec", // Витус.Видео
  "7636311": "https://script.google.com/macros/s/AKfycbxEhpewNP0z_3dPdpQX9BLbwpYasg5ZE55xv_y2Da7zOImwGF_Zsa2jK83wHKfJHhcd/exec", // Глагол.Труппа
  "370748": "https://script.google.com/macros/s/AKfycbylwMrMZjpZi8PdCW6dmr2PEziNFz2DPQBCpoC1MhUcrI5OZEqBXZTBabNFPEdxSnB1fA/exec", // Глагол.Народный театр
};

export default async function handler(req, res) {
  // 1. Разрешаем только POST-запросы (ВК отправляет именно их)
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }


  try {
    const body = req.body;
    
    // ВК присылает group_id как число, преобразуем в строку для надежного поиска в объекте
    const groupId = String(body.group_id); 

    // 2. Ищем нужный URL Google Apps Script для этой группы
    const targetGasUrl = BOT_ROUTES[groupId];

    if (!targetGasUrl) {
      console.warn(`⚠️ Получен запрос от неизвестной группы: ${groupId}`);
      // Возвращаем 'error', чтобы ВК понял, что сервер не принял запрос, и попытался снова
      return res.status(200).send('error'); 
    }

    const response = await fetch(targetGasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      redirect: 'follow', // ВАЖНО: Vercel автоматически пройдет сквозь 302 редирект Google!
    });

    // 4. Получаем текстовый ответ от GAS (например, "14d8c0c2" или "ok")
    const gasResponseText = await response.text();

    // 5. Возвращаем ответ ВКонтакте строго в формате plain text
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(gasResponseText.trim());
  } catch (err) {
    console.error('❌ Ошибка проксирования в VK Proxy:', error);
    res.status(500).send('error');
  }
}
