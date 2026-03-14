/**
 * Footer component.
 */
export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-section">
          <h3><i class="bi bi-palette"></i> ArtMarket</h3>
          <p>Connecting artists with art lovers worldwide. Discover unique artwork from talented creators.</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <a href="/" data-link>Home</a>
          <a href="/artists" data-link>Artists</a>
          <a href="/products" data-link>Browse Art</a>
        </div>
        <div class="footer-section">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Contact Us</a>
          <a href="#">Terms of Service</a>
        </div>
        <div class="footer-section">
          <h4>Follow Us</h4>
          <div class="footer-social">
            <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="#" aria-label="Twitter"><i class="bi bi-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ArtMarket. All rights reserved.</p>
      </div>
    </div>
  `;
  return footer;
}
