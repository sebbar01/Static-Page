
async function loadModels() {
  try {
 
    const resp = await fetch('/data/models');
    if (!resp.ok) {
      throw new Error('HTTP error: ' + resp.status);
    }
    const models = await resp.json(); 
 

    const container = document.getElementById('modelsGrid');
    container.innerHTML = ''; 

    if (!models.length) {
      container.innerHTML = '<p class="no-models">Brak dostępnych modeli w bazie.</p>';
      return;
    }


    models.forEach(item => {

      const card = document.createElement('article');
      card.classList.add('model-card');


      const imgFileName = item.model.toLowerCase().replace(/\s+/g, '_') + '.jpg';
      const imgPath = '/images/' + imgFileName; 

      card.innerHTML = `
        <div class="card-image">
          <img src="${imgPath}" 
               alt="${item.model}" 
               onerror="this.src='/images/placeholder.jpg'">
          <div class="card-title-bar"></div>
          <h3 class="card-title">${item.model} (${item.generation})</h3>
        </div>
        <div class="card-description-container">
          <p class="card-description">
            Rok: ${item.year}<br>
            Moc: ${item.horsepower} KM<br>
            Cena: ${item.price.toLocaleString('pl-PL')} PLN
          </p>
        </div>
        <button class="card-button" data-id="${item.id}">Więcej Info</button>
      `;


      container.appendChild(card);
    });
  } catch (error) {
    console.error('Błąd podczas ładowania modeli:', error);
    const container = document.getElementById('modelsGrid');
    container.innerHTML = '<p class="no-models">Wystąpił problem przy ładowaniu modeli.</p>';
  }
}


async function handleContactForm(event) {
  event.preventDefault();
  const form = event.currentTarget;

  const first_name = form.querySelector('input[placeholder="Imię"]').value.trim();
  const last_name  = form.querySelector('input[placeholder="Nazwisko"]').value.trim();
  const subject    = form.querySelector('input[placeholder="Temat"]').value.trim();
  const message    = form.querySelector('textarea[placeholder="Wiadomość"]').value.trim();

  if (!first_name || !last_name || !subject || !message) {
    alert('Proszę wypełnić wszystkie pola.');
    return;
  }

  try {
    const res = await fetch('/data/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, subject, message })
    });
    const result = await res.json();

    if (res.ok) {
      alert('Dziękujemy za wiadomość! Dane zostały zapisane.');
      form.reset();
    } else {
      alert('Wystąpił błąd: ' + result.error);
    }
  } catch (err) {
    alert('Nie udało się wysłać formularza. Spróbuj ponownie później.');
  }
}

document.addEventListener('DOMContentLoaded', () => {

  loadModels();

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }
});
