/**
 * Footer component.
 */
export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div>
          <h3 class="footer__brand"><i class="bi bi-palette"></i> ArtMarket</h3>
          <p class="footer__desc">Connecting artists with art lovers worldwide. Discover unique artwork from talented creators.</p>
        </div>
        <div>
          <h4 class="footer__heading">Quick Links</h4>
          <div class="footer__links">
            <a class="footer__link" href="/" data-link>Home</a>
            <a class="footer__link" href="/artists" data-link>Artists</a>
            <a class="footer__link" href="/products" data-link>Browse Art</a>
          </div>
        </div>
        <div>
          <h4 class="footer__heading">Support</h4>
          <div class="footer__links">
            <a class="footer__link" href="#">Help Center</a>
            <a class="footer__link" href="#">Contact Us</a>
            <a class="footer__link" href="#">Terms of Service</a>
          </div>
        </div>
        <div>
          <h4 class="footer__heading">Follow Us</h4>
          <div class="footer__social">
            <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" aria-label="Twitter"><i class="bi bi-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <p>&copy; ${new Date().getFullYear()} ArtMarket. All rights reserved.</p>
      </div>
    </div>
  `;
  return footer;
}
