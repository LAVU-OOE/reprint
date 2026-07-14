let a1 = [
    { artNr: "4040", bez: "Elektro-Kleingeräte (ohne Akku)", zusatzMitte: "QR-Box" },
    { artNr: "4010", bez: "Elektro-Großgeräte", zusatzMitte: "Gitterbox" },
    { artNr: "4020", bez: "Kühlgeräte", zusatzMitte: "Kühlgeräte" },
    { artNr: "4030", bez: "Bildschirmgeräte / TV", zusatzMitte: "TV-Box" },
    { artNr: "1550", bez: "Bauschutt (Kleinmengen)", zusatzMitte: "Mulde" },
    { artNr: "1610", bez: "Altholz (Stofflich)", zusatzMitte: "Holzbox" },
    { artNr: "1620", bez: "Altholz (Thermisch)", zusatzMitte: "Holzbox" },
    { artNr: "1210", bez: "Altmetall / Schrott", zusatzMitte: "Schrottbox" },
    { artNr: "1720", bez: "Verpackungshohlglas", zusatzMitte: "Glas-Hub" },
    { artNr: "1730", bez: "Flachglas", zusatzMitte: "Gestell" },
    { artNr: "1410", bez: "Altpapier (Kartonagen)", zusatzMitte: "Presse" },
    { artNr: "5110", bez: "Problemstoffe (Haushalt)", zusatzMitte: "Problo-Box" },
    { artNr: "1820", bez: "Altreifen (mit Felgen)", zusatzMitte: "Reifenlager" },
    { artNr: "1810", bez: "Altreifen (ohne Felgen)", zusatzMitte: "Reifenlager" },
    { artNr: "4050", bez: "Gasentladungslampen", zusatzMitte: "Lampen-Box" }
];

let a2 = [];
let a3 = 'select';

window.addEventListener('DOMContentLoaded', async () => {
    s7();
    
    let a4 = localStorage.getItem('lavu_sortiment_url');
    if (!a4) {
        a4 = "https://raw.githubusercontent.com/LAVU-OOE/Etiketten-Druckstudio/refs/heads/main/sortiment.json";
        localStorage.setItem('lavu_sortiment_url', a4);
    }
    
    document.getElementById('i4').value = a4;
    document.getElementById('n1').innerHTML = `⏳ Verbinde...`;
    document.getElementById('n1').style.color = '#f39c12';
    
    await f2();
    u1();
});

async function f2() {
    const a4 = localStorage.getItem('lavu_sortiment_url');
    if (a4) {
        try {
            const a5 = await fetch(a4, { cache: "no-store" });
            if (!a5.ok) throw new Error("Netzwerkantwort war fehlerhaft");
            const a6 = await a5.json();
            if (Array.isArray(a6) && a6.length > 0) {
                a2 = a6;
                localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
                document.getElementById('n1').innerHTML = `🟢 Verbunden mit GitHub-Repository`;
                document.getElementById('n1').style.color = '#27ae60';
                i1();
                return;
            }
        } catch (e) {
            console.warn("Fehler beim Laden von GitHub URL, weiche auf cache / localStorage aus.", e);
            document.getElementById('n1').innerHTML = `⚠️ GitHub Offline! Lokaler Cache geladen.`;
            document.getElementById('n1').style.color = '#e74c3c';
        }
    }

    const a7 = localStorage.getItem('lavu_studio_sortiment_v8');
    if (a7) {
        try {
            a2 = JSON.parse(a7);
        } catch(e) {
            a2 = [...a1];
        }
    } else {
        a2 = [...a1];
    }
    i1();
}

async function f1() {
    const a8 = document.getElementById('i4').value.trim();
    if (!a8) {
        localStorage.removeItem('lavu_sortiment_url');
        document.getElementById('n1').innerHTML = `Status: Rein lokaler Modus (localStorage)`;
        document.getElementById('n1').style.color = '#7f8c8d';
        a2 = [...a1];
        localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
        i1();
        p1();
        alert("Verlinkung entfernt. Standard-Sortiment geladen.");
        return;
    }

    let a9 = a8;
    if (a9.includes("github.com") && !a9.includes("raw.githubusercontent.com")) {
        a9 = a9.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
        document.getElementById('i4').value = a9;
    }

    localStorage.setItem('lavu_sortiment_url', a9);
    document.getElementById('n1').innerHTML = `⏳ Verbinde...`;
    document.getElementById('n1').style.color = '#f39c12';
    await f2();
}

setInterval(() => {
    const a4 = localStorage.getItem('lavu_sortiment_url');
    if (a4 && a3 === 'select') {
        f2();
    }
}, 30000);

function i1() {
    const a10 = document.getElementById('s2');
    const a11 = a10.value;
    a10.innerHTML = '';

    a2.forEach((a12, a13) => {
        const a14 = document.createElement('option');
        a14.value = a13;
        a14.textContent = `${a12.artNr} - ${a12.bez}`;
        a10.appendChild(a14);
    });

    if (a11 !== "" && a11 < a2.length) {
        a10.value = a11;
    } else {
        a10.value = "0";
    }
    
    r1();
}

function x1(a15) {
    document.getElementById('i1').value = a15;
    u1();
}

function x2(a15) {
    document.getElementById('s1').value = a15;
    u1();
}

function m2(a16) {
    a3 = a16;
    document.getElementById('t2').classList.toggle('a', a16 === 'select');
    document.getElementById('t3').classList.toggle('a', a16 === 'input');
    document.getElementById('s3').classList.toggle('a', a16 === 'select');
    document.getElementById('s4').classList.toggle('a', a16 === 'input');
}

function r1() {
    const a17 = document.getElementById('c4');
    if (!a17) return;
    a17.innerHTML = '';

    a2.forEach((a12, a13) => {
        const a18 = document.createElement('div');
        a18.className = 'cir';
        a18.innerHTML = `
            <div class="cii">
                <b>${a12.artNr}</b> - ${a12.bez} <span style="color:#7f8c8d; font-size:0.75rem;">(${a12.zusatzMitte || '-'})</span>
            </div>
            <div style="display: flex; gap: 4px;">
                <button class="bc" style="padding: 3px 6px; background: #3498db; color: white; font-size: 0.75rem;" onclick="e3(${a13})" title="Bearbeiten">✏️</button>
                <button class="bc" style="padding: 3px 6px; background: #e74c3c; color: white; font-size: 0.75rem;" onclick="d1(${a13})" title="Löschen">🗑️</button>
            </div>
        `;
        a17.appendChild(a18);
    });
}

function e3(a13) {
    const a12 = a2[a13];
    document.getElementById('e1').value = a13;
    document.getElementById('c1').value = a12.artNr;
    document.getElementById('c2').value = a12.zusatzMitte || "";
    document.getElementById('c3').value = a12.bez;
    document.getElementById('b1').style.display = 'inline-block';
}

function d1(a13) {
    if (confirm(`Möchten Sie den Artikel "${a2[a13].bez}" wirklich aus der Datenbank löschen?`)) {
        a2.splice(a13, 1);
        localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
        i1();
        p1();
    }
}

function c3() {
    document.getElementById('e1').value = "-1";
    document.getElementById('c1').value = "";
    document.getElementById('c2').value = "";
    document.getElementById('c3').value = "";
    document.getElementById('b1').style.display = 'none';
}

function s5() {
    const a19 = document.getElementById('c1').value.trim();
    const a20 = document.getElementById('c2').value.trim();
    const a21 = document.getElementById('c3').value.trim();
    const a22 = parseInt(document.getElementById('e1').value);

    if (!a19 || !a21) {
        alert("Artikel-Nr. und Bezeichnung sind erforderlich!");
        return;
    }

    const a23 = { artNr: a19, bez: a21, zusatzMitte: a20 };

    if (a22 > -1) {
        a2[a22] = a23;
    } else {
        a2.push(a23);
    }

    localStorage.setItem('lavu_studio_sortiment_v8', JSON.stringify(a2));
    i1();
    c3();
    p1();
}

function e2() {
    if (!a2 || a2.length === 0) {
        alert("Es sind keine Sortimentsdaten zum Exportieren vorhanden.");
        return;
    }
    try {
        const a24 = JSON.stringify(a2, null, 2);
        const a25 = new Blob([a24], { type: "application/json;charset=utf-8;" });
        const a26 = URL.createObjectURL(a25);
        
        const a27 = document.createElement("a");
        a27.href = a26;
        a27.download = "sortiment.json";
        
        document.body.appendChild(a27);
        a27.click();
        
        document.body.removeChild(a27);
        URL.revokeObjectURL(a26);
    } catch (a28) {
        console.error("Fehler beim Exportieren:", a28);
        alert("Export fehlgeschlagen: " + a28.message);
    }
}

function p1() {
    const a10 = document.getElementById('s2');
    if (!a10 || a10.value === "") return;

    const a13 = parseInt(a10.value);
    const a12 = a2[a13];

    if (a12) {
        document.getElementById('i5').value = a12.artNr;
        document.getElementById('i6').value = a12.zusatzMitte || "";
        document.getElementById('i7').value = a12.bez;
        u1();
    }
}

function g1() {
    return {
        topText: document.getElementById('i1').value,
        artNr: document.getElementById('i5').value.trim(),
        suffix: document.getElementById('i6').value.trim(),
        bezeichnung: document.getElementById('i7').value.trim(),
        count: parseInt(document.getElementById('i2').value) || 0,
        startPos: parseInt(document.getElementById('i3').value) || 1
    };
}

function u1() {
    const a29 = g1();

    document.getElementById('d1').textContent = a29.bezeichnung || '-';
    document.getElementById('d2').textContent = a29.artNr || '-';
    document.getElementById('d3').textContent = a29.suffix || '-';
    document.getElementById('d4').textContent = `${a29.count}x ab Position ${a29.startPos}`;
    
    document.getElementById('s1').value = a29.topText;
    document.getElementById('i1').value = a29.topText;

    r2('t1', a29);
    r2('mdl', a29);
    r2('d5', a29);
    
    if (document.getElementById('m2').style.display === 'flex') {
        s8();
    }
}

function r2(a30, a29) {
    const a31 = document.getElementById(a30);
    if (!a31) return;
    a31.innerHTML = '';

    const a32 = 21;
    const a33 = a29.startPos - 1;
    const a34 = a33 + a29.count;

    for (let a35 = 0; a35 < a32; a35++) {
        const a36 = document.createElement('div');

        if (a35 >= a33 && a35 < a34) {
            a36.className = 'lb';
            a36.innerHTML = `
                <div class="lbt">${a29.topText}</div>
                <div class="lbm">
                    <div class="lba">${a29.artNr}</div>
                    ${a29.suffix ? `<div class="lbs">${a29.suffix}</div>` : ''}
                </div>
                <div class="lbb">${a29.bezeichnung}</div>
            `;
            
            if (a30 === 'mdl') {
                a36.addEventListener('click', () => {
                    h1(a35 + 1, 'remove');
                });
            }
        } else {
            a36.className = 'lb e';
            
            if (a30 === 'mdl') {
                a36.addEventListener('click', () => {
                    h1(a35 + 1, 'add');
                });
            }
        }
        a31.appendChild(a36);
    }
}

function h1(a37, a38) {
    const a39 = document.getElementById('i2');
    const a40 = document.getElementById('i3');
    
    let a41 = parseInt(a39.value) || 0;
    let a42 = parseInt(a40.value) || 1;
    let a43 = a42 + a41 - 1;

    if (a38 === 'add') {
        if (a41 === 0) {
            a42 = a37;
            a41 = 1;
        } else if (a37 < a42) {
            a42 = a37;
            a41 = a43 - a42 + 1;
        } else if (a37 > a43) {
            a41 = a37 - a42 + 1;
        }
    } else if (a38 === 'remove') {
        if (a37 === a42) {
            a42++;
            a41--;
        } else if (a37 === a43) {
            a41--;
        } else {
            a41 = a37 - a42;
        }
    }

    a41 = Math.max(0, Math.min(21, a41));
    a42 = Math.max(1, Math.min(21, a42));

    a39.value = a41;
    a40.value = a42;
    
    u1();
}

function s8() {
    const a44 = document.querySelector('.mbs');
    const a45 = document.getElementById('p1');
    
    if (!a44 || !a45) return;

    a45.style.transform = 'none';
    a45.style.position = 'static';

    const a46 = a45.offsetWidth;
    const a47 = a45.offsetHeight;

    const a48 = a44.clientWidth - 40;
    const a49 = a44.clientHeight - 40;

    const a50 = a48 / a46;
    const a51 = a49 / a47;
    const a52 = Math.min(a50, a51, 1);

    a45.style.position = 'absolute';
    a45.style.top = '50%';
    a45.style.left = '50%';
    a45.style.transformOrigin = 'center center';
    a45.style.transform = `translate(-50%, -50%) scale(${a52})`;
}

function o2() {
    document.getElementById('m1').style.display = 'flex';
    r1();
}
function c2() {
    document.getElementById('m1').style.display = 'none';
}
function c1(a53) {
    if (a53.target.id === 'm1') c2();
}
function o1() {
    u1();
    document.getElementById('m2').style.display = 'flex';
    setTimeout(s8, 50);
}
function c5() {
    document.getElementById('m2').style.display = 'none';
}
function c4(a53) {
    if (a53.target.id === 'm2') c5();
}

window.addEventListener('resize', () => {
    if (document.getElementById('m2').style.display === 'flex') {
        s8();
    }
});

function s6() {
    const a54 = {
        topText: document.getElementById('i1').value,
        count: document.getElementById('i2').value,
        startPos: document.getElementById('i3').value,
        sortimentIndex: document.getElementById('s2').value,
        artNr: document.getElementById('i5').value,
        suffix: document.getElementById('i6').value,
        bezeichnung: document.getElementById('i7').value
    };

    localStorage.setItem('lavu_studio_defaults_v8', JSON.stringify(a54));
    const a55 = document.getElementById('b2');
    a55.innerHTML = '✓ Gespeichert!';
    a55.style.backgroundColor = '#27ae60';

    setTimeout(() => {
        a55.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Standard sichern';
        a55.style.backgroundColor = '#3498db';
    }, 1800);
}

function s7() {
    const a56 = localStorage.getItem('lavu_studio_defaults_v8');
    if (a56) {
        try {
            const a54 = JSON.parse(a56);
            if (a54.topText !== undefined) {
                document.getElementById('i1').value = a54.topText;
                document.getElementById('s1').value = a54.topText;
            }
            if (a54.count !== undefined) document.getElementById('i2').value = Math.min(21, a54.count);
            if (a54.startPos !== undefined) document.getElementById('i3').value = Math.min(21, a54.startPos);
            if (a54.artNr !== undefined) document.getElementById('i5').value = a54.artNr;
            if (a54.suffix !== undefined) document.getElementById('i6').value = a54.suffix;
            if (a54.bezeichnung !== undefined) document.getElementById('i7').value = a54.bezeichnung;
            if (a54.sortimentIndex !== undefined) {
                setTimeout(() => {
                    document.getElementById('s2').value = a54.sortimentIndex;
                    p1();
                }, 100);
            }
        } catch (e) {
            console.warn("Fehler beim Verarbeiten lokaler Defaults.", e);
        }
    }
}

let a57;
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(a58 => {
                console.log('Service Worker erfolgreich registriert!', a58);
                a58.update();

                a58.addEventListener('updatefound', () => {
                    const a59 = a58.installing;
                    a59.addEventListener('statechange', () => {
                        if (a59.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                a59.postMessage({ action: 'skipWaiting' });
                            }
                        }
                    });
                });
            })
            .catch(a60 => console.error('Service Worker Registrierung fehlgeschlagen:', a60));
    });

    let a61 = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!a61) {
            a61 = true;
            window.location.reload(true);
        }
    });
}

window.addEventListener('beforeinstallprompt', (a62) => {
    a62.preventDefault();
    a57 = a62;
    const a63 = document.getElementById('pwaBanner');
    if (a63) a63.style.display = 'flex';
});

const a64 = document.getElementById('b3');
if (a64) {
    a64.addEventListener('click', () => {
        if (a57) {
            a57.prompt();
            a57.userChoice.then((a65) => {
                if (a65.outcome === 'accepted') {
                    console.log('User hat die Installation von LAVU Etiketten-Druckstudio akzeptiert.');
                }
                const a63 = document.getElementById('pwaBanner');
                if (a63) a63.style.display = 'none';
                a57 = null;
            });
        }
    });
}
window.addEventListener('appinstalled', () => {
    console.log('LAVU Etiketten-Druckstudio wurde erfolgreich installiert.');
    const a63 = document.getElementById('pwaBanner');
    if (a63) a63.style.display = 'none';
});