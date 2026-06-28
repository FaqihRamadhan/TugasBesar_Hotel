const A = 'http://localhost:3000/api';
const $ = id => document.getElementById(id);

let rP = 1, rE = 0, gP = 1, gE = 0, bP = 1, bE = 0;
const LM = 10;
let allRooms = [];

// ─── UTILITAS ────────────────────────────────────────────────────────────────

function toast(m, t = 's') {
  const e = $('toast');
  e.className = `show ${t}`;
  e.innerHTML = (t === 's' ? '✅ ' : '❌ ') + m;
  clearTimeout(e._t);
  e._t = setTimeout(() => e.className = '', 3000);
}

function fmtRp(el) {
  let v = el.value.replace(/\D/g, '');
  el.value = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function rp2n(s) { return Number(s.replace(/\./g, '')) || 0; }
function dt(d) { return d ? new Date(d).toISOString().slice(0, 10) : ''; }

function bdg(s) {
  const m = { Available: 'ba', Occupied: 'bo', Maintenance: 'bm', 'On-Going': 'bg', Completed: 'bc', Cancelled: 'bx' };
  return `<span class="bdg ${m[s] || 'bg'}"><i></i>${s}</span>`;
}

function tags(a) {
  return (a || []).map(f => `<span class="tag">${f}</span>`).join('');
}

function rel(d, mn, sb, lb) {
  return d
    ? `<div class="rc"><b>${mn(d)}</b><small>${sb(d)}</small></div>`
    : `<div class="rc"><em>⚠️ ${lb}</em></div>`;
}

function pgn(nv, inf, tot, cur, fn) {
  const n = $(nv);
  n.innerHTML = '';
  $(inf).textContent = `Halaman ${cur} dari ${tot}`;
  for (let i = 1; i <= tot; i++) {
    const b = document.createElement('button');
    b.className = 'pb' + (i === cur ? ' on' : '');
    b.textContent = i;
    b.onclick = () => fn(i);
    n.appendChild(b);
  }
}

function ac(ef, df) {
  return `<div class="ta"><button class="be" onclick="${ef}">✏️ Edit</button><button class="bd" onclick="${df}">🗑 Hapus</button></div>`;
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab);
});

// ─── ROOMS ───────────────────────────────────────────────────────────────────

async function fetchR(p = 1) {
  rP = p;
  const res = await fetch(`${A}/rooms?page=${p}&limit=${LM}`).catch(() => null);
  if (!res) return $('rTB').innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--rd)">⚠️ Server tidak dapat dijangkau.</td></tr>`;
  const r = await res.json(), d = r.data ?? r;
  $('rCnt').innerHTML = `Menampilkan <strong>${d.length}</strong> dari <strong>${r.totalData ?? d.length}</strong> kamar`;
  $('rTB').innerHTML = d.length
    ? d.map(x => `<tr>
        <td><span class="id">${x._id}</span></td>
        <td>${x.type}</td>
        <td class="pc">Rp ${x.price.toLocaleString('id-ID')}<small>/malam</small></td>
        <td>${tags(x.facilities)}</td>
        <td>${bdg(x.status)}</td>
        <td><span class="fp">${x.floor}</span></td>
        <td>${ac(`editR(${JSON.stringify(x).replace(/'/g, "\\'")})`,'delR(' + x._id + ')')}</td>
      </tr>`).join('')
    : `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--mu)">Belum ada data kamar.</td></tr>`;
  if (r.totalPages) pgn('rPN', 'rPI', r.totalPages, r.currentPage, fetchR);
}

$('rF').onsubmit = async e => {
  e.preventDefault();
  const id = $('rId').value;
  const d = {
    _id: Number(id),
    type: $('rTp').value,
    price: rp2n($('rPr').value),
    facilities: $('rFc').value.split(',').map(f => f.trim()),
    status: $('rSt').value,
    floor: Number($('rFl').value)
  };
  const res = await fetch(rE ? `${A}/rooms/${id}` : `${A}/rooms`, {
    method: rE ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d)
  }).catch(() => null);
  res?.ok ? (toast(rE ? 'Kamar diperbarui!' : 'Kamar ditambahkan!'), $('rF').reset(), resetR(), fetchR(1), loadDrop()) : toast('Gagal menyimpan kamar.', 'e');
};

function editR(x) {
  rE = 1;
  $('rFT').textContent = `Edit Kamar #${x._id}`;
  $('rMI').className = 'mode me';
  $('rMT').textContent = `Mode: Edit #${x._id}`;
  $('rBS').textContent = '💾 Simpan Perubahan';
  $('rBC').style.display = 'flex';
  $('rId').value = x._id;
  $('rId').disabled = true;
  $('rTp').value = x.type;
  $('rPr').value = x.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  $('rFc').value = x.facilities.join(', ');
  $('rSt').value = x.status;
  $('rFl').value = x.floor;
}

async function delR(id) {
  if (!confirm(`Hapus kamar #${id}?`)) return;
  const res = await fetch(`${A}/rooms/${id}`, { method: 'DELETE' }).catch(() => null);
  res?.ok ? (toast(`Kamar #${id} dihapus.`), fetchR(rP), loadDrop()) : toast('Gagal hapus.', 'e');
}

$('rBC').onclick = () => { $('rF').reset(); resetR(); };

function resetR() {
  rE = 0;
  $('rFT').textContent = 'Tambah Kamar Baru';
  $('rMI').className = 'mode ma';
  $('rMT').textContent = 'Mode: Tambah Data Baru';
  $('rBS').textContent = '💾 Simpan Kamar';
  $('rBC').style.display = 'none';
  $('rId').disabled = false;
}

// ─── GUESTS ──────────────────────────────────────────────────────────────────

async function fetchG(p = 1) {
  gP = p;
  const res = await fetch(`${A}/guests?page=${p}&limit=${LM}`).catch(() => null);
  if (!res) return $('gTB').innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--rd)">⚠️ Server tidak dapat dijangkau.</td></tr>`;
  const r = await res.json(), d = r.data ?? r;
  $('gCnt').innerHTML = `Menampilkan <strong>${d.length}</strong> dari <strong>${r.totalData ?? d.length}</strong> tamu`;
  $('gTB').innerHTML = d.length
    ? d.map(x => `<tr>
        <td><span class="id">${x._id}</span></td>
        <td>${x.name}</td>
        <td>${x.email}</td>
        <td>${x.phone}</td>
        <td>${x.city}</td>
        <td>${ac(`editG(${JSON.stringify(x).replace(/'/g, "\\'")})`,'delG("' + x._id + '")')}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--mu)">Belum ada data tamu.</td></tr>`;
  if (r.totalPages) pgn('gPN', 'gPI', r.totalPages, r.currentPage, fetchG);
}

$('gF').onsubmit = async e => {
  e.preventDefault();
  const id = $('gId').value;
  const d = { _id: id, name: $('gNm').value, email: $('gEm').value, phone: $('gPh').value, city: $('gCt').value };
  const res = await fetch(gE ? `${A}/guests/${id}` : `${A}/guests`, {
    method: gE ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d)
  }).catch(() => null);
  res?.ok ? (toast(gE ? 'Tamu diperbarui!' : 'Tamu ditambahkan!'), $('gF').reset(), resetG(), fetchG(1), loadDrop()) : toast('Gagal menyimpan tamu.', 'e');
};

function editG(x) {
  gE = 1;
  $('gFT').textContent = `Edit Tamu #${x._id}`;
  $('gMI').className = 'mode me';
  $('gMT').textContent = `Mode: Edit #${x._id}`;
  $('gBS').textContent = '💾 Simpan Perubahan';
  $('gBC').style.display = 'flex';
  $('gId').value = x._id;
  $('gId').disabled = true;
  $('gNm').value = x.name;
  $('gEm').value = x.email;
  $('gPh').value = x.phone;
  $('gCt').value = x.city;
}

async function delG(id) {
  if (!confirm(`Hapus tamu ${id}?`)) return;
  const res = await fetch(`${A}/guests/${id}`, { method: 'DELETE' }).catch(() => null);
  res?.ok ? (toast(`Tamu ${id} dihapus.`), fetchG(gP), loadDrop()) : toast('Gagal hapus.', 'e');
}

$('gBC').onclick = () => { $('gF').reset(); resetG(); };

function resetG() {
  gE = 0;
  $('gFT').textContent = 'Tambah Tamu Baru';
  $('gMI').className = 'mode ma';
  $('gMT').textContent = 'Mode: Tambah Data Baru';
  $('gBS').textContent = '💾 Simpan Tamu';
  $('gBC').style.display = 'none';
  $('gId').disabled = false;
}

// ─── BOOKINGS ────────────────────────────────────────────────────────────────

async function fetchB(p = 1) {
  bP = p;
  const res = await fetch(`${A}/bookings?page=${p}&limit=${LM}`).catch(() => null);
  if (!res) return $('bTB').innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--rd)">⚠️ Server tidak dapat dijangkau.</td></tr>`;
  const r = await res.json(), d = r.data ?? r;
  $('bCnt').innerHTML = `Menampilkan <strong>${d.length}</strong> dari <strong>${r.totalData ?? d.length}</strong> pemesanan`;
  $('bTB').innerHTML = d.length
    ? d.map(x => `<tr>
        <td><span class="id">${x._id}</span></td>
        <td>${rel(x.guest_detail, g => g.name, g => g.city || '-', 'Tamu?')}</td>
        <td>${rel(x.room_detail, r => 'Kamar ' + r._id, r => r.type || '-', 'Kamar?')}</td>
        <td>${new Date(x.check_in).toLocaleDateString('id-ID')}</td>
        <td>${new Date(x.check_out).toLocaleDateString('id-ID')}</td>
        <td class="pc">Rp ${(x.total_payment || 0).toLocaleString('id-ID')}</td>
        <td>${bdg(x.status)}</td>
        <td>${ac(`editB(${JSON.stringify(x).replace(/'/g, "\\'")})`,'delB("' + x._id + '")')}</td>
      </tr>`).join('')
    : `<tr><td colspan="8" style="text-align:center;padding:36px;color:var(--mu)">Belum ada data pemesanan.</td></tr>`;
  if (r.totalPages) pgn('bPN', 'bPI', r.totalPages, r.currentPage, fetchB);
}

$('bF').onsubmit = async e => {
  e.preventDefault();
  const id = $('bId').value;
  if (!$('bTp').value) return toast('Pastikan kamar, check-in, dan check-out sudah valid agar total bayar terhitung.', 'e');
  const d = {
    _id: id,
    guest_id: $('bGs').value,
    room_id: Number($('bRm').value),
    check_in: $('bCI').value,
    check_out: $('bCO').value,
    total_payment: rp2n($('bTp').value),
    status: $('bSt').value
  };
  const res = await fetch(bE ? `${A}/bookings/${id}` : `${A}/bookings`, {
    method: bE ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d)
  }).catch(() => null);
  res?.ok ? (toast(bE ? 'Pemesanan diperbarui!' : 'Pemesanan ditambahkan!'), $('bF').reset(), resetB(), fetchB(1)) : toast('Gagal menyimpan pemesanan.', 'e');
};

function editB(x) {
  bE = 1;
  $('bFT').textContent = `Edit Pemesanan #${x._id}`;
  $('bMI').className = 'mode me';
  $('bMT').textContent = `Mode: Edit #${x._id}`;
  $('bBS').textContent = '💾 Simpan Perubahan';
  $('bBC').style.display = 'flex';
  $('bId').value = x._id;
  $('bId').disabled = true;
  $('bGs').value = x.guest_id;
  renderRoomOptions(x.room_id);
  $('bRm').value = x.room_id;
  $('bCI').value = dt(x.check_in);
  $('bCO').value = dt(x.check_out);
  $('bTp').value = (x.total_payment || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  $('bSt').value = x.status;
}

async function delB(id) {
  if (!confirm(`Hapus pemesanan ${id}?`)) return;
  const res = await fetch(`${A}/bookings/${id}`, { method: 'DELETE' }).catch(() => null);
  res?.ok ? (toast(`Pemesanan ${id} dihapus.`), fetchB(bP)) : toast('Gagal hapus.', 'e');
}

$('bBC').onclick = () => { $('bF').reset(); resetB(); };

function resetB() {
  bE = 0;
  $('bFT').textContent = 'Tambah Pemesanan Baru';
  $('bMI').className = 'mode ma';
  $('bMT').textContent = 'Mode: Tambah Data Baru';
  $('bBS').textContent = '💾 Simpan Pemesanan';
  $('bBC').style.display = 'none';
  $('bId').disabled = false;
  renderRoomOptions();
  $('bTp').value = '';
}

// ─── DROPDOWN & KALKULASI ────────────────────────────────────────────────────

async function loadDrop() {
  const [gr, rr] = await Promise.all([
    fetch(`${A}/guests?limit=200`),
    fetch(`${A}/rooms?limit=200`)
  ]).catch(() => [null, null]);
  if (!gr || !rr) return;
  const gs = (await gr.json()).data ?? [];
  allRooms = (await rr.json()).data ?? [];
  $('bGs').innerHTML = '<option value="">— Pilih Tamu —</option>' +
    gs.map(g => `<option value="${g._id}">${g._id} — ${g.name}</option>`).join('');
  renderRoomOptions();
}

function renderRoomOptions(selectedId) {
  let avail = allRooms.filter(r => r.status === 'Available');
  if (selectedId != null && !avail.some(r => String(r._id) === String(selectedId))) {
    const cur = allRooms.find(r => String(r._id) === String(selectedId));
    if (cur) avail = [cur, ...avail];
  }
  $('bRm').innerHTML = '<option value="">— Pilih Kamar —</option>' +
    avail.map(r => `<option value="${r._id}">Kamar ${r._id} — ${r.type} (Rp ${r.price.toLocaleString('id-ID')}/malam)${r.status !== 'Available' ? ' — sedang dipesan' : ''}</option>`).join('');
}

function calcTotal() {
  const ci = $('bCI').value, co = $('bCO').value, roomId = $('bRm').value;
  if (!ci || !co || !roomId) return $('bTp').value = '';
  const room = allRooms.find(r => String(r._id) === String(roomId));
  if (!room) return $('bTp').value = '';
  const nights = Math.round((new Date(co) - new Date(ci)) / 86400000);
  $('bTp').value = nights > 0 ? (nights * room.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
}

$('bRm').onchange = calcTotal;
$('bCI').onchange = calcTotal;
$('bCO').onchange = calcTotal;

// ─── INIT ─────────────────────────────────────────────────────────────────────

window.onload = () => { fetchR(); fetchG(); fetchB(); loadDrop(); };
