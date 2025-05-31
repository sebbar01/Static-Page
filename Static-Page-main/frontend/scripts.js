document.querySelector('.contact-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const first_name = this.querySelector('input[placeholder="Imię"]').value.trim();
  const last_name = this.querySelector('input[placeholder="Nazwisko"]').value.trim();
  const subject = this.querySelector('input[placeholder="Temat"]').value.trim();
  const message = this.querySelector('textarea[placeholder="Wiadomość"]').value.trim();

  if (!first_name || !last_name || !subject || !message) {
    alert('Proszę wypełnić wszystkie pola.');
    return;
  }

  try {
 const response = await fetch('http://localhost:3000/data/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ first_name, last_name, subject, message })
});


    const result = await response.json();
    if (response.ok) {
      alert('Dziękujemy za wiadomość! Dane zostały zapisane.');
      this.reset();
    } else {
      alert('Wystąpił błąd: ' + result.error);
    }
  } catch (error) {
    alert('Nie udało się wysłać formularza. Spróbuj ponownie później.');
  }
});
