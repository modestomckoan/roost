// 小栖 - 栖ROOST陪伴AI助手
(function () {
  const STORAGE_KEY = "roost_xiaoxi_chat";
  const USER_PREF_KEY = "roost_user_preference";
  // 预设快捷问答（断网降级使用）
  const faqMap = {
    "怎么切换引导人声/背景音": "你可以在冥想练习页面上方的设置面板，下拉选择引导声音与背景环境音，支持引导音和背景音叠加播放哦。",
    "我静不下心，该怎么办": "很多人冥想时都会念头纷飞，不用责怪自己。觉察到思绪跑开，只需要温柔地把注意力带回呼吸就好，推荐试试Day2的呼吸觉察练习。",
    "30天课程是什么": "30天正念课程循序渐进，从安顿呼吸、身体扫描，慢慢学习和情绪共处，每天约15分钟，跟着引导练习就可以。",
    "冥想时身体不舒服要停下吗": "是的。冥想过程如果感到任何不适、紧绷或者难受，随时可以暂停练习，不用硬坚持，照顾自己永远是第一位。"
  };

  // 用户本地记忆初始化
  let userData = JSON.parse(localStorage.getItem(USER_PREF_KEY) || "{}");
  let chatHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  // 创建DOM容器
  const wrapper = document.createElement("div");
  wrapper.id = "xiaoxi-wrapper";
  wrapper.innerHTML = `
    <button id="xiaoxi-float-btn" style="
      position: fixed;
      bottom: 24px;
      right:24px;
      width:56px;
      height:56px;
      border-radius: 50%;
      border:none;
      background:#e6efe9;
      color:#486357;
      box-shadow: 0 2px 12px rgba(72,99,87,0.15);
      font-size:16px;
      z-index:999;
      cursor:pointer;
      transition: all 0.3s ease;
      display:flex;
      align-items:center;
      justify-content:center;
    ">小栖</button>
    <div id="xiaoxi-panel" style="
      position:fixed;
      bottom:90px;
      right:24px;
      width:360px;
      max-height:60vh;
      background:#f8f7f2;
      border-radius:18px;
      box-shadow:0 4px 20px rgba(0,0,0,0.1);
      z-index:998;
      display:none;
      overflow:hidden;
      flex-direction:column;
    ">
      <div style="padding:16px 20px;border-bottom:1px solid #e9e8e0;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:500;color:#486357;">小栖 · 陪伴助手</span>
        <button id="xiaoxi-close" style="border:none;background:transparent;cursor:pointer;color:#777;">✕</button>
      </div>
      <div id="xiaoxi-chat-area" style="flex:1;padding:16px;overflow-y:auto;gap:12px;display:flex;flex-direction:column;"></div>
      <div id="xiaoxi-quick-btn-area" style="padding:12px 16px;display:flex;flex-wrap:wrap;gap:8px;border-top:1px solid #e9e8e0;">
      </div>
      <div style="padding:12px 16px;border-top:1px solid #e9e8e0;display:flex;gap:8px;">
        <input id="xiaoxi-input" type="text" placeholder="输入你的问题..." style="flex:1;padding:10px 12px;border-radius:12px;border:1px solid #ddd;background:#fff;outline:none;">
        <button id="xiaoxi-send" style="padding:10px 16px;border-radius:12px;border:none;background:#e6efe9;color:#486357;cursor:pointer;">发送</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const floatBtn = document.getElementById("xiaoxi-float-btn");
  const panel = document.getElementById("xiaoxi-panel");
  const closeBtn = document.getElementById("xiaoxi-close");
  const chatArea = document.getElementById("xiaoxi-chat-area");
  const quickArea = document.getElementById("xiaoxi-quick-btn-area");
  const inputEl = document.getElementById("xiaoxi-input");
  const sendBtn = document.getElementById("xiaoxi-send");

  // 渲染快捷按钮
  function renderQuickButtons() {
    quickArea.innerHTML = "";
    Object.keys(faqMap).forEach(q => {
      const btn = document.createElement("button");
      btn.textContent = q;
      btn.style = "padding:6px 10px;border-radius:8px;border:none;background:#fff;color:#555;cursor:pointer;font-size:13px;";
      btn.onclick = ()=> submitMsg(q);
      quickArea.appendChild(btn);
    })
  }

  // 渲染对话消息
  function renderChat() {
    chatArea.innerHTML = "";
    if(chatHistory.length ===0){
      addBotMsg("你好，我是小栖，栖ROOST的陪伴助手✨\n我可以帮你了解冥想练习、调整设置，陪你聊聊练习中的感受。今天打算开始哪一天的练习？", false);
    }else{
      chatHistory.forEach(item=>{
        if(item.role === "user") addUserMsg(item.content);
        else addBotMsg(item.content, false);
      })
    }
  }
  function addUserMsg(text){
    const div = document.createElement("div");
    div.style = "align-self:flex-end;background:#e6efe9;padding:8px 12px;border-radius:12px;max-width:80%;white-space:pre-wrap;color:#222";
    div.textContent = text;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
  function addBotMsg(text, save=true){
    const div = document.createElement("div");
    div.style = "align-self:flex-start;background:#fff;padding:8px 12px;border-radius:12px;max-width:80%;white-space:pre-wrap;color:#333";
    div.textContent = text;
    chatArea.appendChild(div);
    if(save){
      chatHistory.push({role:"bot", content:text});
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    }
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // 消息提交
  async function submitMsg(text){
    if(!text.trim()) return;
    addUserMsg(text);
    chatHistory.push({role:"user", content:text});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
    inputEl.value = "";

    // 网络判断，断网降级FAQ
    if(!navigator.onLine){
      const ans = faqMap[text] ?? "网络断开啦，我暂时只能回答预设问题，你可以点击上方快捷按钮提问。";
      addBotMsg(ans);
      return;
    }

    // ===== API调用区，后续填入你的API Key，当前先模拟回复，方便预览 =====
    // 【预留大模型API接入位置】
    // 这里后续替换为真实API请求，传入 chatHistory + 用户冥想状态
    // 脑电预留变量：window.roostBrainRelax = 0~1 放松分数，冥想页会同步写入这个全局变量
    const brainState = window.roostBrainRelax ?? 0.5;
    const mockReply = await getMockReply(text, brainState);
    addBotMsg(mockReply);
  }

  // 模拟AI回复（预览阶段使用，上线后替换为真实LLM请求）
  async function getMockReply(userMsg, relaxScore){
    await new Promise(r=> setTimeout(r, 700));
    const lowerMsg = userMsg.toLowerCase();
    if(lowerMsg.includes("静不下") || lowerMsg.includes("杂念")){
      return "我懂这种感受。冥想不是清空大脑，而是觉察念头，不用强迫自己什么都不想。当发现思绪飘走，轻轻带回呼吸就可以。你现在放松程度一般，试试Day2的呼吸练习，节奏会很温和。";
    }else if(lowerMsg.includes("30天")){
      return "30天正念课程循序渐进，每天15分钟。从呼吸安顿，慢慢学习身体扫描，后续还会学习和情绪共处，每天难度平缓上升，很适合新手。";
    }else if(lowerMsg.includes("声音") || lowerMsg.includes("背景音")){
      return "在冥想练习页面的设置面板，你可以自由切换引导人声和背景环境音，引导音频和背景音可以叠加在一起播放，找到最让你舒服的搭配。";
    }else if(lowerMsg.includes("不舒服") || lowerMsg.includes("疼")){
      return "身体的感受永远优先。一旦冥想过程有难受、紧绷的感觉，可以随时暂停练习，不用硬撑。照顾自己，才是练习的本意。";
    }else if(lowerMsg.includes("你好")){
      return "你好呀😊 很高兴和你相遇，今天想进行冥想练习，还是有什么疑问想问我？";
    }
    return "我在听。可以和我说说你的感受，或者关于栖冥想课程、设置的问题，我会陪着你。";
  }

  // 按钮事件
  floatBtn.onclick = ()=>{
    const show = panel.style.display !== "flex";
    panel.style.display = show ? "flex" : "none";
    if(show) renderChat();
  }
  closeBtn.onclick = ()=> panel.style.display = "none";
  sendBtn.onclick = ()=> submitMsg(inputEl.value);
  inputEl.onkeydown = (e)=> e.key === "Enter" && submitMsg(inputEl.value);

  // 冥想播放时悬浮按钮半透明
  document.addEventListener("roostMeditationStart", ()=>{
    floatBtn.style.opacity = "0.4";
  })
  document.addEventListener("roostMeditationEnd", ()=>{
    floatBtn.style.opacity = "1";
  })

  // 初始化
  renderQuickButtons();
  renderChat();
})();
