// 小栖AI陪伴助手 v1.0 - 离线版
(function(){
  const floatBtn = document.createElement('div');
  floatBtn.style = `
    position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px;
    border-radius: 50%; background: linear-gradient(135deg, #8FB996, #B8D8BA);
    box-shadow: 0 4px 20px rgba(143,185,150,0.4); cursor: pointer; z-index: 9999;
    display: flex; align-items: center; justify-content: center; font-size: 24px;
    transition: transform 0.3s ease;
  `;
  floatBtn.innerText = '🍃';
  floatBtn.onmouseover = () => floatBtn.style.transform = 'scale(1.1)';
  floatBtn.onmouseout = () => floatBtn.style.transform = 'scale(1)';
  document.body.appendChild(floatBtn);

  const chatBox = document.createElement('div');
  chatBox.style = `
    position: fixed; bottom: 90px; right: 24px; width: 340px; height: 480px;
    background: #f8faf7; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    z-index: 9999; display: none; flex-direction: column; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  chatBox.innerHTML = `
    <div style="padding:16px; background: linear-gradient(135deg, #8FB996, #B8D8BA); color:white;">
      <div style="font-weight:600; font-size:16px;">小栖 🍃</div>
      <div style="font-size:12px; opacity:0.9; margin-top:2px;">陪你慢慢静下来</div>
    </div>
    <div id="chatMsgs" style="flex:1; padding:16px; overflow-y:auto; background:#f8faf7;"></div>
    <div style="padding:12px; border-top:1px solid #e5e7eb; background:white;">
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        <button style="font-size:12px; padding:4px 10px; border-radius:12px; border:1px solid #8FB996; background:white; color:#5a7d60; cursor:pointer;">我静不下心怎么办</button>
        <button style="font-size:12px; padding:4px 10px; border-radius:12px; border:1px solid #8FB996; background:white; color:#5a7d60; cursor:pointer;">30天课程是什么</button>
        <button style="font-size:12px; padding:4px 10px; border-radius:12px; border:1px solid #8FB996; background:white; color:#5a7d60; cursor:pointer;">冥想时身体不舒服要停吗</button>
      </div>
      <div style="display:flex; gap:8px;">
        <input id="chatInput" placeholder="和小栖说点什么..." style="flex:1; padding:8px 12px; border:1px solid #e5e7eb; border-radius:8px; outline:none;">
        <button id="chatSend" style="padding:8px 16px; background:#8FB996; color:white; border:none; border-radius:8px; cursor:pointer;">发送</button>
      </div>
    </div>
  `;
  document.body.appendChild(chatBox);

  let opened = false;
  floatBtn.onclick = () => {
    opened = !opened;
    chatBox.style.display = opened ? 'flex' : 'none';
    if(opened) greet();
  };

  const msgs = document.getElementById('chatMsgs');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');

  function addMsg(text, isUser=false){
    const div = document.createElement('div');
    div.style = `margin-bottom:12px; ${isUser ? 'text-align:right;' : ''}`;
    div.innerHTML = `<div style="display:inline-block; padding:8px 12px; border-radius:12px; max-width:80%; font-size:14px; line-height:1.5; ${isUser ? 'background:#8FB996; color:white;' : 'background:white; color:#374151;'}">${text}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    let history = JSON.parse(localStorage.getItem('xiaoxi_chat') || '[]');
    history.push({text, isUser, time: Date.now()});
    localStorage.setItem('xiaoxi_chat', JSON.stringify(history));
  }

  function greet(){
    const history = JSON.parse(localStorage.getItem('xiaoxi_chat') || '[]');
    if(history.length === 0){
      addMsg('你好呀，我是小栖 🍃 今天感觉怎么样？想聊点什么，或者直接开始今天的冥想都可以。');
    } else {
      addMsg('又见到你啦，今天想从哪一刻开始安静下来呢？');
    }
    history.forEach(m => addMsg(m.text, m.isUser));
  }

  function reply(text){
    const lower = text.toLowerCase();
    if(lower.includes('静不下心') || lower.includes('烦躁') || lower.includes('焦虑')){
      return '没关系的呀，静不下来是很正常的事，不用逼自己马上就静下来。我们可以先从3次长长的呼吸开始，就只是跟着我吸气——呼气——慢慢就好了，我陪着你。';
    }
    if(lower.includes('30天') || lower.includes('课程')){
      return '30天的课程是从最基础的呼吸开始，一天一天慢慢带你认识自己的身体和思绪，不用急，我们一天只做一点点，就像散步一样，慢慢走就到了。';
    }
    if(lower.includes('不舒服') || lower.includes('疼') || lower.includes('痛')){
      return '如果冥想的时候身体觉得不舒服，随时停下来就好，不用硬撑。我们冥想不是为了完成任务，是为了让自己舒服一点，怎么舒服怎么来。';
    }
    if(lower.includes('你好') || lower.includes('嗨')){
      return '嗨呀，你来啦。今天外面风很软，要不要找个舒服的地方坐一会儿？';
    }
    if(lower.includes('谢谢')){
      return '不用谢呀，我一直在这儿陪你的。';
    }
    return '嗯，我在听你说呢。你慢慢讲，不着急，我们一起在这里待一会儿。';
  }

  function send(){
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, true);
    input.value = '';
    setTimeout(()=> addMsg(reply(text)), 800);
  }

  sendBtn.onclick = send;
  input.onkeydown = (e) => e.key === 'Enter' && send();
})();