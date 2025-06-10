<script>
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-800 text-gray-300 py-12 sm:py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
      <!-- About Section -->
      <div class="sm:col-span-2 md:col-span-1">
        <h5 class="text-lg font-semibold text-white mb-4 ubuntu-regular">เกี่ยวกับ Pictoria</h5>
        <p class="text-sm leading-relaxed">
          แพลตฟอร์มสำหรับค้นหาและดาวน์โหลดภาพถ่าย สต็อกวิดีโอ และเวกเตอร์คุณภาพสูงสำหรับโปรเจกต์สร้างสรรค์ของคุณ เรามุ่งมั่นที่จะนำเสนอเนื้อหาที่ดีที่สุดจากช่างภาพและศิลปินทั่วโลก
        </p>
        <!-- Optional: Logo -->
        <!-- <img src="/logo-white.svg" alt="Logo" class="mt-4 h-8"> -->
      </div>

      <!-- Quick Links -->
      <div>
        <h5 class="text-lg font-semibold text-white mb-4">ลิงก์ด่วน</h5>
        <ul class="space-y-3 text-sm">
          <li><a href="/about" class="hover:text-white transition-colors duration-200">เกี่ยวกับเรา</a></li>
          <li><a href="/contact" class="hover:text-white transition-colors duration-200">ติดต่อเรา</a></li>
          <li><a href="/faq" class="hover:text-white transition-colors duration-200">คำถามที่พบบ่อย</a></li>
          <li><a href="/pricing" class="hover:text-white transition-colors duration-200">ราคาและแพ็กเกจ</a></li>
          <li><a href="/blog" class="hover:text-white transition-colors duration-200">บทความ</a></li>
        </ul>
      </div>

      <!-- Legal & Help -->
      <div>
        <h5 class="text-lg font-semibold text-white mb-4">ช่วยเหลือ & กฎหมาย</h5>
        <ul class="space-y-3 text-sm">
          <li><a href="/terms-of-service" class="hover:text-white transition-colors duration-200">ข้อตกลงการใช้งาน</a></li>
          <li><a href="/privacy-policy" class="hover:text-white transition-colors duration-200">นโยบายความเป็นส่วนตัว</a></li>
          <li><a href="/license-agreement" class="hover:text-white transition-colors duration-200">ข้อตกลงใบอนุญาต</a></li>
          <li><a href="/sitemap" class="hover:text-white transition-colors duration-200">แผนผังเว็บไซต์</a></li>
        </ul>
      </div>

      <!-- Social Media & Contact -->
      <div>
        <h5 class="text-lg font-semibold text-white mb-4">ติดตามเรา</h5>
        <div class="flex space-x-4 mb-5">
          <!-- Replace # with your actual social media links and consider using SVG icons from a library or your own files -->
          <a href="#" aria-label="Facebook" class="text-gray-400 hover:text-white transition-colors duration-200">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
          <a href="#" aria-label="Instagram" class="text-gray-400 hover:text-white transition-colors duration-200">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4c2.21 0 4 1.791 4 4s-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" aria-label="Twitter" class="text-gray-400 hover:text-white transition-colors duration-200">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.422.724-.665 1.56-.665 2.452 0 1.606.816 3.022 2.054 3.847-.76-.025-1.474-.234-2.101-.579v.052c0 2.244 1.595 4.118 3.712 4.549-.388.105-.797.162-1.224.162-.299 0-.588-.028-.872-.082.589 1.842 2.3 3.182 4.325 3.221-1.581 1.239-3.577 1.975-5.753 1.975-.374 0-.742-.022-1.105-.065 2.049 1.317 4.485 2.088 7.14 2.088 8.567 0 13.255-7.098 13.255-13.254 0-.202-.005-.403-.014-.603.91-.658 1.7-1.476 2.323-2.403z"/>
            </svg>
          </a>
        </div>
        <p class="text-sm mb-1">อีเมล: <a href="mailto:support@yourwebsite.com" class="hover:text-white transition-colors duration-200">ipnioko54@gmail.com</a></p>
        <p class="text-sm">โทร: <a href="tel:+66123456789" class="hover:text-white transition-colors duration-200">+66 95 123 6881</a></p>
      </div>
    </div>

    <div class="border-t border-gray-700 pt-8 mt-8 text-center text-sm">
      <p class="ubuntu-regular">&copy; {currentYear} Pictoria. สงวนลิขสิทธิ์.</p>
      <p class="mt-2 text-gray-400">
        ออกแบบและพัฒนาด้วย <span class="text-red-400">&hearts;</span> โดย เจษฎา บุญทา
      </p>
    </div>
  </div>
</footer>
