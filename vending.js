const TABS = [
  {
    id: 'topping', label: 'เนื้อ', items: [
      { id: 't1', image: 'images/t1.png', name: 'กุ้ง', price: 15 },
      { id: 't2', image: 'images/t2.png', name: 'หมูสับ', price: 10 },
      { id: 't3', image: 'images/t3.png', name: 'ไส้กรอก', price: 7 },
      { id: 't4', image: 'images/t4.png', name: 'หมูยอ', price: 10 },
      { id: 't5', image: 'images/t5.png', name: 'ปูอัด', price: 5 },
      { id: 't6', image: 'images/t6.png', name: 'เนื้อไก่', price: 10 },
      { id: 't7', image: 'images/t7.png', name: 'หมูกรอบ', price: 15 },
    ]
  },
  {
    id: 'vetgetable', label: 'ผัก', items: [
      { id: 'v1', image: 'images/v1.png', name: 'พริก', price: 5 },
      { id: 'v2', image: 'images/v2.png', name: 'ชะอม', price: 3 },
      { id: 'v3', image: 'images/v3.png', name: 'มะเขือเทศ', price: 7 },
      { id: 'v4', image: 'images/v4.png', name: 'เเครอท', price: 5 },
      { id: 'v5', image: 'images/v5.png', name: 'หัวหอม', price: 3 },
    ]
  },
  {
    id: 'rice', label: 'ข้าว', items: [
      { id: 'r1', image: 'images/r1.png', name: 'ข้าวสวย', price: 15 },
      { id: 'r2', image: 'images/r2.png', name: 'ข้างกล้อง', price: 15 },
      { id: 'r3', image: 'images/r3.png', name: 'ข้าวเหนียว', price: 15 },
    ]
  },
  {
    id: 'source', label: 'ซอส', items: [
      { id: 's1', image: 'images/s1.png', name: 'ซอสมะเขือเทศ', price: 5 },
      { id: 's2', image: 'images/s2.png', name: 'ซอสพริก', price: 5 },
      { id: 's3', image: 'images/s3.png', name: 'ซอสซาวครีม', price: 5 },
      { id: 's5', image: 'images/s4.png', name: 'ซอสเเม็กกี้', price: 5 }
    ]
  },
];

const DENOMS = [1000, 500, 100, 50, 20, 10, 5, 2, 1];

let activeTab = TABS[0].id;
const quantities = {};
TABS.flatMap(t => t.items).forEach(it => quantities[it.id] = 0);
let inserted = 0;

const tabsEl = document.getElementById('tabs');
const itemsGrid = document.getElementById('itemsGrid');
const denomsEl = document.getElementById('denoms');
const totalPriceEl = document.getElementById('totalPrice');
const insertedEl = document.getElementById('inserted');
const msgEl = document.getElementById('msg');
const modalRoot = document.getElementById('modalRoot');

function renderTabs() {
  tabsEl.innerHTML = '';
  TABS.forEach(t => {
    const b = document.createElement('button');
    b.className = 'tab' + (t.id === activeTab ? ' active' : '');
    b.textContent = t.label;
    b.onclick = () => { activeTab = t.id; renderItems(); renderTabs(); }
    tabsEl.appendChild(b);
  });
}

function renderItems() {
  itemsGrid.innerHTML = '';
  const tab = TABS.find(t => t.id === activeTab);
  tab.items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'item' + (quantities[it.id] > 0 ? ' selected' : '');
    div.innerHTML = `
      <div>
        <img src="${it.image}" class="img">
        <div class="meta">${it.name}</div>
        <div class="price">ราคา ${it.price} บาท</div>
      </div>
    `;

    div.addEventListener('click', () => {
      if (quantities[it.id] > 0) {
        quantities[it.id] = 0;
        div.classList.remove('selected');
      } else {
        quantities[it.id] = 1;
        div.classList.add('selected');
      }
      updateTotal();
    });

    itemsGrid.appendChild(div);
  });
}


function renderDenoms() {
  denomsEl.innerHTML = '';
  DENOMS.forEach(d => {
    const b = document.createElement('div'); b.className = 'denom'; b.textContent = d + ' ฿';
    b.onclick = () => { inserted += d; updateInserted(); }
    denomsEl.appendChild(b);
  })
}

function updateTotal() {
  const total = calcTotal();
  totalPriceEl.textContent = total + ' บาท';
}

function updateInserted() {
  insertedEl.textContent = inserted + ' บาท';
}

function calcTotal() {
  return TABS.flatMap(t => t.items).reduce((s, it) => s + (quantities[it.id] || 0) * it.price, 0);
}

function calcChange(amount) {
  let remain = amount; const breakdown = [];
  for (const d of DENOMS) {
    const c = Math.floor(remain / d);
    if (c > 0) { breakdown.push({ denom: d, count: c }); remain -= c * d; }
  }
  return { breakdown, remain };
}

function showModal(changeObj, message) {
  modalRoot.style.display = 'block';
  modalRoot.innerHTML = '';
  const backdrop = document.createElement('div'); backdrop.className = 'modal-backdrop';
  const modal = document.createElement('div'); modal.className = 'modal';
  modal.innerHTML = `<div style="font-weight:700;font-size:18px">${message}</div>`;
  if (changeObj) {
    const content = document.createElement('div'); content.className = 'change-list';
    if (changeObj.breakdown.length === 0) {
      content.innerHTML = '<div style="margin-top:8px;color:var(--muted)">ไม่มีเงินทอน</div>';
    } else {
      changeObj.breakdown.forEach(b => {
        const r = document.createElement('div'); r.className = 'change-row';
        r.innerHTML = `<div>฿${b.denom} x ${b.count}</div><div style="font-weight:600">${b.denom * b.count} บาท</div>`;
        content.appendChild(r);
      })
    }
    modal.appendChild(content);
  }

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:12px';
  const close = document.createElement('button');
  close.className = 'btn ghost';
  close.textContent = 'ปิด';
  close.onclick = () => {
    modalRoot.style.display = 'none';
  }
  const done = document.createElement('button');
  done.className = 'btn primary'; done.textContent = 'เสร็จสิ้น';
  done.onclick = () => {
    resetAll();
    modalRoot.style.display = 'none';
    wait();
  }
  actions.appendChild(close);
  actions.appendChild(done);
  modal.appendChild(actions);
  backdrop.appendChild(modal);
  modalRoot.appendChild(backdrop);
}

document.getElementById('calcBtn').onclick = () => {
  msgEl.textContent = '';
  const total = calcTotal();
  if (total === 0) {
    msgEl.textContent = 'กรุณาเลือกสินค้าอย่างน้อย 1 ชิ้น';
    return;
  }
  if (inserted < total) {
    msgEl.textContent = `เงินยังไม่พอ (รวม ${inserted} บาท, ต้องจ่าย ${total} บาท)`;
    return;
  }
  const change = inserted - total;
  const { breakdown, remain } = calcChange(change);
  if (remain !== 0) {
    msgEl.textContent = `ไม่สามารถทอนจำนวน ${remain} ได้ (ค่าเศษ)`;
  }
  showModal({ breakdown, remain }, `ทอนเงิน ${change} บาท`);
}

document.getElementById('resetBtn').onclick = () => resetAll();

function resetAll() {
  TABS.flatMap(t => t.items).forEach(it => quantities[it.id] = 0);
  inserted = 0;
  updateInserted();
  updateTotal();
  msgEl.textContent = '';
  document.querySelectorAll('#itemsGrid .item.selected').forEach(el => el.classList.remove('selected'));
}
function wait() {
  const afterModal = document.createElement('div');
  afterModal.className = 'after-modal';
  afterModal.innerHTML = `
    <div class="after-backdrop">
      <div class="after-box">
        <img src="images/wait.png" alt="Thank You">
        <div style="font-size:20px;font-weight:600;margin-top:20px">กำลังเริ่มทำอาหาร...</div>
        <button class="btn primary" id="afterClose" style="margin-top:30px">ปิด</button>
      </div>
    </div>
  `;
  document.body.appendChild(afterModal);

  document.getElementById('afterClose').onclick = () => {
    afterModal.remove();
  };
}

const images = [
    'images/ex1.png',
    'images/ex2.png',
    'images/ex3.png',
    'images/ex4.png',
    'images/ex5.png',
    'images/ex6.png',
  ];

  let currentIndex = 0;

  const manualBtn = document.getElementById('manualBtn');
  const modal = document.getElementById('manualModal');
  const modalImg = document.getElementById('manualImage');
  const close = document.querySelector('.close');

  manualBtn.onclick = () => {
    currentIndex = 0;
    modalImg.src = images[currentIndex];
    modal.style.display = 'flex';
  };

  close.onclick = () => {
    modal.style.display = 'none';
  };

  document.getElementById('prev').onclick = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    modalImg.src = images[currentIndex];
  };

  document.getElementById('next').onclick = () => {
    currentIndex = (currentIndex + 1) % images.length;
    modalImg.src = images[currentIndex];
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };


renderTabs();
renderItems();
renderDenoms();
updateTotal();
updateInserted();