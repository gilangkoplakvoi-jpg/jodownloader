// 1. Fungsi Paste
async function pasteLink() {
    const btn = document.getElementById('pasteBtn');
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('urlInput').value = text;
        btn.innerText = "DONE!";
        setTimeout(() => btn.innerText = "PASTE", 1500);
    } catch (err) { alert("Berikan izin akses clipboard!"); }
}

// 2. Fungsi Download
async function autoSave(url, name) {
    const btn = event.target;
    const oldText = btn.innerHTML;
    btn.innerText = "SAVING...";
    
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const bUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = bUrl; a.download = name;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(bUrl);
        btn.innerText = "SUCCESS!";
    } catch (e) {
        window.open(url, '_blank');
        btn.innerText = "OPENED";
    }
    setTimeout(() => btn.innerHTML = oldText, 2500);
}

// 3. Fungsi Utama
async function processData() {
    const input = document.getElementById('urlInput');
    const btn = document.getElementById('mainBtn');
    const resultDiv = document.getElementById('result');
    const url = input.value.trim();

    if (!url.includes("tiktok.com")) {
        alert("⚠️ Link TikTok tidak valid!");
        return;
    }

    // Ubah teks saat sedang loading
    btn.innerHTML = '<span class="loading-spinner"></span> PROCESSING...';
    btn.disabled = true;
    resultDiv.style.display = 'none';

    try {
        const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        const data = json.data;

        if (!data) throw new Error();

        const now = new Date();
        const timeID = now.getFullYear() + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) + "_" + ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2) + ("0" + now.getSeconds()).slice(-2);

        let mHtml = ''; let aHtml = '';

        if (data.images && data.images.length > 0) {
            mHtml = '<div class="photo-stack">';
            data.images.forEach((img, i) => {
                const proxied = `https://images.weserv.nl/?url=${encodeURIComponent(img)}`;
                mHtml += `
                <div class="photo-unit">
                    <img src="${proxied}">
                    <button class="photo-dl-overlay" onclick="autoSave('${img}', 'JO_IMG_${timeID}_${i+1}.jpg')">
                        📸 SAVE #${i+1}
                    </button>
                </div>`;
            });
            mHtml += '</div>';
        } else {
            mHtml = `<video controls style="width:100%; border-radius:24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);"><source src="${data.play}" type="video/mp4"></video>`;
            aHtml += `<button class="btn-action btn-v-main" onclick="autoSave('${data.play}', 'JO_VIDEO_${timeID}.mp4')">
                🎬 DOWNLOAD VIDEO (NO WM)
            </button>`;
        }
        
        aHtml += `<button class="btn-action btn-m-soft" onclick="autoSave('${data.music}', 'JO_AUDIO_${timeID}.mp3')">
            🎵 DOWNLOAD AUDIO (MP3)
        </button>`;
        
        document.getElementById('mediaArea').innerHTML = mHtml;
        document.getElementById('actionArea').innerHTML = aHtml;
        resultDiv.style.display = 'block';

        input.value = "";

    } catch (e) { 
        alert("Gagal mengambil data. Coba link lainnya."); 
    } finally {
        // KEMBALI KE EXECUTE LINK
        btn.innerHTML = "EXECUTE LINK";
        btn.disabled = false;
    }
}