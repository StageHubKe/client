import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { SiX } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-950 via-black to-gray-900 text-gray-300 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* About Section */}
        <div>
          <h4 className="text-yellow-400 text-xl font-bold mb-4">About StageHub</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            StageHub connects talented artists with event organizers.
            Discover, hire, and collaborate with the best performers and
            creatives for your next event — all in one platform.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-yellow-400 text-xl font-bold mb-4">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#artists" className="hover:text-yellow-400 transition-colors duration-200">
                Artists
              </a>
            </li>
            <li>
              <a href="#howitworks" className="hover:text-yellow-400 transition-colors duration-200">
                How It Works
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-yellow-400 transition-colors duration-200">
                Contact
              </a>
            </li>
            <li>
              <a href="/register" className="hover:text-yellow-400 transition-colors duration-200">
                Join as Artist
              </a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-yellow-400 text-xl font-bold mb-4">Follow Us</h4>
          <div className="flex gap-4 mt-2">
            {[
              { Icon: FaFacebookF, color: "hover:text-blue-500", href: "https://facebook.com" },
              { Icon: FaInstagram, color: "hover:text-pink-500", href: "https://instagram.com" },
              { Icon: FaTiktok, color: "hover:text-gray-100", href: "https://tiktok.com" },
              { Icon: SiX, color: "hover:text-gray-100", href: "https://x.com" },
            ].map(({ Icon, color, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-gray-800 hover:bg-gray-700 p-3 rounded-full transition-all duration-300 ${color} hover:scale-110 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)]`}
              >
                <Icon className="text-lg" />
              </a>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-yellow-400 text-xl font-bold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <span className="font-medium text-gray-300">Email:</span> support@stagehub.com
            </li>
            <li>
              <span className="font-medium text-gray-300">Phone:</span> +1 234 567 890
            </li>
            <li>
              <span className="font-medium text-gray-300">Location:</span> New York, USA
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 mt-8 py-6 text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="text-yellow-400 font-semibold">StageHub</span>. All rights reserved.
        </p>
        <p className="text-xs mt-1 text-gray-600">
          Built with ❤️ by the StageHub Team
        </p>
      </div>
    </footer>
  );
};

export default Footer;
