
import React from 'react';
import Layout from '@theme/Layout';

const FounderCard = ({ name, role, image, bio, twitter, linkedin }) => (
  <div className="group bg-dark-card rounded-3xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] flex flex-col items-center p-8 active:scale-95">
    <div className="relative w-40 h-40 mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-20 group-hover:opacity-50 transition-opacity duration-300" />
      <img src={image} alt={name} className="relative w-full h-full object-cover rounded-full border-4 border-dark-card group-hover:border-primary/30 transition-colors duration-300" />
    </div>
    <h3 className="text-3xl font-bold text-white mb-2">{name}</h3>
    <p className="text-primary font-medium tracking-wide uppercase text-sm mb-6">{role}</p>
    <p className="text-gray-400 text-center mb-8 leading-relaxed">{bio}</p>
    <div className="flex gap-12 mt-auto">
      {twitter && (
        <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors transform hover:scale-110 duration-300">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
        </a>
      )}
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors transform hover:scale-110 duration-300">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
        </a>
      )}
    </div>
  </div>
);

const SpecialCard = ({ title, description, icon }) => (
  <div className="group bg-dark-card p-8 rounded-3xl border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] hover:-translate-y-2 flex flex-col items-center text-center h-full">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300 text-primary">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
  </div>
);

export default function About() {
  return (
    <Layout title="About Us" description="Meet the team behind Kubesimplify">
      <div className="bg-dark-bg min-h-screen py-32 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-blob" />
        <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-50" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Mission Section */}
          <div className="text-center max-w-4xl mx-auto mb-32 animate-fade-in">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-md">
              <span className="text-primary font-bold tracking-wide text-sm uppercase">Our Story</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
              Our Mission
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light max-w-3xl mx-auto">
              We are on a mission to <span className="text-white font-semibold">simplify cloud native technologies</span> for everyone, providing high-quality, accessible education and fostering a welcoming community for learners at all levels.
            </p>
          </div>

          {/* Founders Section */}
          <div className="mb-32">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Meet the Founders</h2>
              <p className="text-gray-400 text-lg">The passionate minds behind Kubesimplify</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <FounderCard
                name="Saiyam Pathak"
                role="Founder"
                image="https://unavatar.io/twitter/saiyampathak"
                bio="CNCF Ambassador, Civo Director of Technical Evangelism, and a passionate educator in the cloud native space. Saiyam has helped thousands of developers start their journey."
                twitter="https://twitter.com/saiyampathak"
                linkedin="https://linkedin.com/in/saiyampathak"
              />
              <FounderCard
                name="Saloni Narang"
                role="Co-Founder"
                image="/img/saloni_new.png"
                bio="Marketing strategist and community builder, driving the vision and growth of Kubesimplify. Saloni ensures our community remains inclusive and helpful."
                twitter="https://twitter.com/saloninarang_"
                linkedin="https://www.linkedin.com/in/saloninarang/"
              />
            </div>
          </div>

          {/* Spacer for Distance */}
          <div className="h-32 w-full" />

          {/* Specials Section */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What We Offer</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Comprehensive learning experiences designed to accelerate your cloud native journey</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SpecialCard
                title="Workshops"
                description="Hands-on learning experiences covering Kubernetes, DevOps, and more. Always up to date with industry standards."
                icon={<svg className="w-12 h-12 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              />
              <SpecialCard
                title="Mentorship"
                description="Guiding the next generation of cloud native practitioners through dedicated mentorship programs and career advice."
                icon={<svg className="w-12 h-12 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              />
              <SpecialCard
                title="Community"
                description="A safe space to ask questions, share knowledge, and grow together. Our Discord is the heartbeat of Kubesimplify."
                icon={<svg className="w-12 h-12 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}