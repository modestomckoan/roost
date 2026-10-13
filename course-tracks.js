/* ============================================================
   栖 ROOST · 多时长课程轨道
   7 天入门营 / 15 天进阶营 / 30 天完整旅程

   纯增量脚本，不改动任何已有课程文案与语音：
   - 7 天营 = 源第 1–7 天（安住当下）
   - 15 天营 = 源第 1–14 天（安住当下 + 倾听身体）
   - 30 天营 = 源第 1–30 天（完整四周）
   连续切片，「昨天 / 明天」的引导叙事与全部语音天然衔接。
   完成记录按源天号保存在 calm_done，跨轨道共享。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 三档轨道定义 ---------- */
  const TRACKS = [
    {
      id: 'starter7',
      name: '7 天入门营',
      short: '安住当下',
      from: 1, to: 7,
      durText: '每天 15 分钟 · 共约 105 分钟',
      brand: '7天 · 入门营',
      title: '7 天，先学会回来',
      intro: '每天 15 分钟。不需要清空念头，只需要一次次回到当下。从认识支撑、自然呼吸，到完整身体扫描，再到走神之后怎样温和地回来。',
      forWhom: '第一次接触冥想，或时间紧、只想先认真试一周的人。',
      youGet: '认识支撑 · 自然呼吸 · 全身扫描 · 走神后回来',
      bannerEn: '7 DAYS · SETTLE IN',
      bannerCn: '一周时间，学会让身体先安顿下来。<br>走神没关系，每一次回来，都是练习。',
      groups: [
        { name: '第一段 · 先安顿下来', days: [1, 2, 3] },
        { name: '第二段 · 扫描与回来', days: [4, 5, 6, 7] }
      ],
      next: 'journey15',
      nextLabel: '继续 15 天进阶营'
    },
    {
      id: 'journey15',
      name: '15 天进阶营',
      short: '倾听身体',
      from: 1, to: 14,
      durText: '每天 15–16 分钟 · 共约 217 分钟',
      brand: '15天 · 进阶营',
      title: '15 天，听懂身体的话',
      intro: '从脚下的稳定到肩颈的分寸，从声音到舒适距离。给紧绷、疲惫和坐不住，一个随时可以返回的地方。',
      forWhom: '完成入门营，或想系统改善身体紧绷、睡眠与专注的人。',
      youGet: '入门营全部内容 · 脚下支撑 · 肩颈与呼吸 · 声音与边界',
      bannerEn: '15 DAYS · LISTEN TO THE BODY',
      bannerCn: '两周，从呼吸到肩颈，把身体变成可返回的地方。<br>紧绷不必被赶走，它只需要被看见。',
      groups: [
        { name: '第一周 · 安住当下', days: [1, 2, 3, 4, 5, 6, 7] },
        { name: '第二周 · 倾听身体', days: [8, 9, 10, 11, 12, 13, 14] }
      ],
      next: 'full30',
      nextLabel: '继续 30 天完整旅程'
    },
    {
      id: 'full30',
      name: '30 天完整旅程',
      short: '慢慢靠近自己',
      from: 1, to: 30,
      durText: '每天 15–20 分钟 · 共约 523 分钟',
      brand: '30天 · 循序渐进',
      title: '30 天，慢慢靠近自己',
      intro: '四周完整路径：安住当下、倾听身体、陪伴内在，再把觉察带进生活。不必每天都状态好，只需要每天都可以回来。',
      forWhom: '想系统建立长期练习，照顾情绪、压力与日常节奏的人。',
      youGet: '四周主题 · 情绪与念头 · 人际与日常 · 属于你的练习组合',
      bannerEn: '30 DAYS · A LITTLE MORE PRESENT',
      bannerCn: '不必清空念头，也不必追求一个分数。<br>在呼吸与声音之间，练习一次次回来。',
      groups: [
        { name: '第一周 · 安住当下', days: [1, 2, 3, 4, 5, 6, 7] },
        { name: '第二周 · 倾听身体', days: [8, 9, 10, 11, 12, 13, 14] },
        { name: '第三周 · 陪伴内在', days: [15, 16, 17, 18, 19, 20, 21] },
        { name: '第四周 · 带入生活', days: [22, 23, 24, 25, 26, 27, 28, 29, 30] }
      ],
      next: null,
      nextLabel: ''
    }
  ];

  const STORE_KEY = 'roost_track';

  /* ---------- 工具函数 ---------- */
  function getTrackId() {
    const id = localStorage.getItem(STORE_KEY);
    return TRACKS.some(t => t.id === id) ? id : 'full30';
  }
  function getTrack() {
    return TRACKS.find(t => t.id === getTrackId()) || TRACKS[2];
  }
  function trackDays(t) {
    const out = [];
    for (let d = t.from; d <= t.to; d++) out.push(d);
    return out;
  }
  function trackDoneCount(t) {
    return trackDays(t).filter(d => state.done[d]).length;
  }
  function trackMinutes(t) {
    return trackDays(t)
      .filter(d => state.done[d])
      .reduce((sum, d) => sum + (PROGRAM[d - 1] ? PROGRAM[d - 1].dur : 0), 0);
  }
  /* 轨道内下一个未完成日；全部完成时回到轨道第一天（复习） */
  function trackNextDay(t) {
    const pending = trackDays(t).find(d => !state.done[d]);
    return pending === undefined ? t.from : pending;
  }
  function clampDayToTrack(day, t) {
    if (day < t.from || day > t.to) return trackNextDay(t);
    return day;
  }

  /* ---------- 切换轨道（全局，供 onclick 调用） ---------- */
  window.selectTrack = function (id) {
    if (!TRACKS.some(t => t.id === id)) return;
    localStorage.setItem(STORE_KEY, id);
    const t = getTrack();
    if (typeof homeRecommendedDay !== 'undefined') {
      homeRecommendedDay = clampDayToTrack(homeRecommendedDay, t);
    }
    renderProgram();
    const list = document.getElementById('programList');
    if (list && list.scrollIntoView) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ---------- 覆盖：课程页渲染 ---------- */
  renderProgram = function () {
    const t = getTrack();

    /* 顶部标题跟随轨道 */
    const brand = document.querySelector('#view-program .brand');
    if (brand) brand.textContent = t.brand;
    const titleEl = document.querySelector('#view-program .page-title');
    if (titleEl) titleEl.textContent = t.title;
    const introEl = document.querySelector('#view-program .intro');
    if (introEl) introEl.textContent = t.intro;

    const list = document.getElementById('programList');
    if (!list) return;

    /* 轨道选择器：只创建一次，之后原地更新 */
    let picker = document.getElementById('trackPicker');
    if (!picker) {
      picker = document.createElement('div');
      picker.id = 'trackPicker';
      list.parentNode.insertBefore(picker, list);
    }
    picker.innerHTML = renderPicker(t);

    /* 续接大卡 + 天数列表 */
    const total = trackDays(t).length;
    const doneCount = trackDoneCount(t);
    const allDone = doneCount === total;

    let html = renderContinueCard(t, doneCount, allDone);

    for (const g of t.groups) {
      html += `<div class="week-block"><h2 class="week-name serif">${g.name}</h2>`;
      for (const dn of g.days) {
        const d = PROGRAM[dn - 1];
        const done = !!state.done[d.day];
        html +=
          `<article class="course-row${done ? ' done' : ''}">` +
            `<button class="course-start" onclick="startSession(${d.day})">` +
              `<span class="day-num">${done ? '✓' : String(d.day).padStart(2, '0')}</span>` +
              `<span><b>${escapeHtml(d.title)}</b>` +
              `<small>${d.dur} 分钟 · 呼吸与身体扫描</small></span>` +
              `<span class="course-arrow">↗</span>` +
            `</button>` +
            `<button class="script-link" onclick="viewScript(${d.day})">查看 / 下载引导词</button>` +
          `</article>`;
      }
      html += '</div>';
    }

    /* 整程完成横幅 */
    if (allDone) {
      const nx = t.next ? TRACKS.find(x => x.id === t.next) : null;
      html +=
        `<div class="track-finish">` +
          `<div class="tf-mark">✓</div>` +
          `<h3 class="serif">这一程，走完了。</h3>` +
          `<p>练习不必有终点。你可以从任意一天随时复习，` +
          (nx ? `也可以继续下一段更长的旅程。` : `继续按自己的节奏，自由地练习。`) + `</p>` +
          (nx
            ? `<button class="cta" onclick="selectTrack('${nx.id}')">${t.nextLabel} ↗</button>`
            : `<button class="cta ghost" onclick="startSession(1)">复习第 1 天</button>`) +
        `</div>`;
    }

    list.innerHTML = html;
  };

  function renderPicker(cur) {
    let html = '<div class="track-picker">';
    for (const x of TRACKS) {
      const total = trackDays(x).length;
      const done = trackDoneCount(x);
      const pct = Math.round((done / total) * 100);
      const on = x.id === cur.id;
      html +=
        `<button class="track-card${on ? ' on' : ''}" onclick="selectTrack('${x.id}')">` +
          `<span class="tc-top">` +
            `<span class="tc-name">${x.name}</span>` +
            `<span class="tc-dot">${on ? '●' : ''}</span>` +
          `</span>` +
          `<span class="tc-sub">${x.short}</span>` +
          `<span class="tc-meta">${x.durText}</span>` +
          `<span class="tc-bar"><i style="width:${pct}%"></i></span>` +
          `<span class="tc-progress">${done} / ${total} 天</span>` +
        `</button>`;
    }
    return html + '</div>';
  }

  function renderContinueCard(t, doneCount, allDone) {
    const nextDay = trackNextDay(t);
    const d = PROGRAM[nextDay - 1];
    let btnText;
    if (allDone) btnText = '从头复习第 1 天';
    else if (doneCount === 0) btnText = `开始第 1 天 · ${PROGRAM[t.from - 1].title}`;
    else btnText = `继续第 ${nextDay} 天 · ${d.title}`;
    return (
      `<div class="track-cta-card">` +
        `<div class="tcc-head">` +
          `<div class="tcc-label">${t.name} · ${t.short}</div>` +
          `<div class="tcc-progress">${doneCount} / ${trackDays(t).length} 天 · 累计 ${trackMinutes(t)} 分钟</div>` +
        `</div>` +
        `<div class="tcc-for">${t.forWhom}</div>` +
        `<div class="tcc-get">${t.youGet}</div>` +
        `<button class="cta" onclick="startSession(${allDone ? t.from : nextDay})">${btnText} ↗</button>` +
      `</div>`
    );
  }

  /* ---------- 覆盖：下一个未完成日（限定在当前轨道内） ---------- */
  nextPendingDay = function () {
    return trackNextDay(getTrack());
  };

  /* ---------- 覆盖：首页渲染（推荐日 / 进度 / 横幅跟随轨道） ---------- */
  renderHome = function () {
    const t = getTrack();

    /* 推荐日：clamp 到当前轨道，已完成则推进到轨道内下一个未完成日 */
    let day = clampDayToTrack(homeRecommendedDay, t);
    if (state.done[day]) day = trackNextDay(t);
    homeRecommendedDay = day;

    const d = PROGRAM[day - 1];
    const total = trackDays(t).length;
    const doneCount = trackDoneCount(t);
    const allDone = doneCount === total;

    const heroLabel = document.getElementById('heroLabel');
    if (heroLabel) {
      heroLabel.textContent = (allDone ? '这一程已完成 · ' : (profile.recDay ? '为你推荐 · ' : '今日校准 · ')) + t.name;
    }
    document.getElementById('homeDayTitle').textContent = `Day ${d.day} · ${d.title}`;
    document.getElementById('homeDaySub').textContent = `约 ${d.dur} 分钟 · ${d.breath.name} · 身体扫描`;
    document.getElementById('homeBreathTag').textContent = d.breath.name;
    document.getElementById('homeDurTag').textContent = d.dur + ' 分钟';

    const hour = new Date().getHours();
    document.getElementById('greetText').textContent = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

    /* 连续天数（全站口径，不受轨道影响） */
    let streak = 0, cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const key = cursor.toDateString();
      const has = Object.values(state.done).some(ts => new Date(ts).toDateString() === key);
      if (has) streak++;
      else if (i > 0) break;
      cursor.setDate(cursor.getDate() - 1);
    }
    document.getElementById('streakNum').textContent = streak;

    /* 统计只数当前轨道；累计分钟含课程与「随时练习」自由模式 */
    const freeMin = (state.logs || []).reduce((sum, x) => sum + (x.minutes || 0), 0);
    document.getElementById('statDone').textContent = doneCount + ' / ' + total;
    document.getElementById('statMin').textContent = trackMinutes(t) + freeMin;

    /* 主按钮文案 */
    const homeCta = document.querySelector('#view-home .hero .cta');
    if (homeCta) homeCta.textContent = allDone ? '复习第 1 天' : '开始今日练习';

    /* 横幅跟随轨道 */
    const banner = document.querySelector('#view-home .home-banner');
    if (banner) {
      const span = banner.querySelector('span');
      const p = banner.querySelector('p');
      if (span) span.textContent = t.bannerEn;
      if (p) p.innerHTML = t.bannerCn;
    }

    startHomeWave();
    renderDaily();
  };

  /* ---------- 加载时收敛推荐日，并补渲染首页 ----------
     upgrade.js 在本脚本加载前就可能已 enterApp()，用旧版逻辑渲染过首页，
     这里把首页重新按当前轨道渲染一次。 */
  try {
    if (typeof homeRecommendedDay !== 'undefined' && typeof PROGRAM !== 'undefined') {
      homeRecommendedDay = clampDayToTrack(homeRecommendedDay, getTrack());
    }
    if (localStorage.getItem('calm_onboarded') === '1') {
      const homeView = document.getElementById('view-home');
      if (homeView && homeView.classList.contains('active')) renderHome();
    }
  } catch (e) { /* 首页逻辑尚未初始化时忽略 */ }
})();
