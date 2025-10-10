import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { SiX } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20 border-t border-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* About Section */}
        <div>
          <h4 className="text-yellow-400 text-xl font-bold mb-4">About StageHub</h4>
          <p className="text-gray-400 text-sm">
            StageHub connects talented artists with event organizers.
            Discover, hire, and collaborate with the best performers and
            creatives for your events.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-yellow-400 text-xl font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#artists" className="hover:text-yellow-400 transition">Artists</a></li>
            <li><a href="#howitworks" className="hover:text-yellow-400 transition">How It Works</a></li>
            <li><a href="#contact" className="hover:text-yellow-400 transition">Contact</a></li>
            <li><a href="/register" className="hover:text-yellow-400 transition">Join as Artist</a></li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-yellow-400 text-xl font-bold mb-4">Follow Us</h4>
          <div className="flex flex-col gap-3 text-lg">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:scale-110 transition-transform"
            >
              <FaFacebookF className="text-blue-600" />
            </a>
            
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:scale-110 transition-transform"
            >
              <FaInstagram className="text-pink-500" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:scale-110 transition-transform"
            >
              <FaTiktok className="text-black" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:scale-110 transition-transform"
            >
              <SiX className="text-black" />
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-yellow-400 text-xl font-bold mb-4">Contact</h4>
          <p className="text-gray-400 text-sm">Email: support@stagehub.com</p>
          <p className="text-gray-400 text-sm">Phone: +1 234 567 890</p>
          <p className="text-gray-400 text-sm">Location: New York, USA</p>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 mt-6 pt-6 text-gray-500 text-sm text-center">
        © {new Date().getFullYear()} StageHub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
