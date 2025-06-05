let reviewsVisible = false; 

async function loadAllReviews() {
  try {
    const res = await fetch('/data/reviews');
    if (!res.ok) throw new Error('HTTP error: ' + res.status);

    const reviews = await res.json();
    const container = document.querySelector('.reviews-grid');
    container.innerHTML = '';

    if (!reviews.length) {
      container.innerHTML = '<p class="no-reviews">Brak opinii w bazie.</p>';
    } else {
      reviews.forEach(item => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          starsHtml += (i <= item.rating)
            ? '<span class="star filled">★</span>'
            : '<span class="star">☆</span>';
        }

        const card = document.createElement('div');
        card.classList.add('review-card');
        card.innerHTML = 
          `<div class="review-header">
            <div class="review-author">${item.reviewer_name}</div>
            <div class="review-stars">${starsHtml}</div>
          </div>
          <p class="review-text">${item.review_text}</p>`
        ;
        container.appendChild(card);
      });
    }

    reviewsVisible = true;
    document.getElementById('showReviewsBtn').textContent = 'Ukryj opinie';
  } catch (error) {
    console.error('Błąd podczas ładowania opinii:', error);
    const container = document.querySelector('.reviews-grid');
    container.innerHTML = '<p class="no-reviews">Wystąpił problem przy ładowaniu opinii.</p>';
    reviewsVisible = false;
  }
}

function hideReviews() {
  const container = document.querySelector('.reviews-grid');
  container.innerHTML = '';
  reviewsVisible = false;
  document.getElementById('showReviewsBtn').textContent = 'Pokaż wszystkie opinie';
}

async function loadModels() {
  try {
    const resp = await fetch('http://localhost:3000/data/models');
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
      const imgPath = './images/' + imgFileName;

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
            Cena: ${(typeof item.price === 'number' ? item.price.toLocaleString('pl-PL') : 'brak danych')} PLN
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

async function handleAddReview(event) {
  const name = document.getElementById('reviewerName').value.trim();
  const rating = document.getElementById('ratingSelect').value;
  const text = document.getElementById('reviewText').value.trim();

  if (!name || !rating || !text) {
    alert('Proszę wypełnić wszystkie pola (imię, ocena i tekst opinii).');
    return;
  }

  try {
    const res = await fetch('/data/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewerName: name,
        rating: parseInt(rating, 10),
        reviewText: text
      })
    });
    const result = await res.json();

    if (res.ok) {
      alert('Opinia została dodana.');
      document.getElementById('addReviewForm').reset();
      loadAllReviews();
    } else {
      alert('Błąd: ' + result.error);
    }
  } catch (err) {
    alert('Nie udało się dodać opinii. Spróbuj ponownie później.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadModels();

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }

  const addReviewBtn = document.getElementById('addReviewBtn');
  if (addReviewBtn) {
    addReviewBtn.addEventListener('click', handleAddReview);
  }

  const showReviewsBtn = document.getElementById('showReviewsBtn');
  if (showReviewsBtn) {
    showReviewsBtn.addEventListener('click', () => {
      if (reviewsVisible) {
        hideReviews();
      } else {
        loadAllReviews();
      }
    });
  }
});
