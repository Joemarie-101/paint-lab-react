import './About.css';
import aboutPoster from '../about_poster.png';
import aboutLogo from '../about_logo.png';

export default function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <section className="about-section">
          <h2>Welcome to Joe's Paint Lab</h2>
          <p>
            Joe's Paint Lab is your ultimate destination for expert paint selection and color consultation. 
            Whether you're looking to transform your home with the perfect paint color or need professional 
            guidance on paint mixing and application, we've got you covered.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We believe that the right color can completely transform a space. Our mission is to make paint 
            selection easy, accessible, and enjoyable by providing expert tools and personalized recommendations 
            tailored to your unique style and needs.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <ul className="about-list">
            <li>Expert brand selection and paint recommendations</li>
            <li>Advanced paint color mixing and visualization tools</li>
            <li>Accurate paint quantity calculator for your projects</li>
            <li>Personalized color history and saved preferences</li>
            <li>Professional paint consultation services</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Get In Touch</h2>
          <p>
            Have questions or need expert advice? We're here to help!
          </p>
          <div className="contact-info">
            <p>📞 123-456-7890</p>
            <p>📧 Joe's.paintlab@gmail.com</p>
            <p>🌐 www.joe'spaintlabsite.com</p>
          </div>
        </section>
      </div>
      <div className="about-images">
        <img src={aboutPoster} alt="Paint Services" className="about-img poster" />
        <img src={aboutLogo} alt="Joe's Paint Lab Logo" className="about-img logo" />
      </div>
    </div>
  );
}
