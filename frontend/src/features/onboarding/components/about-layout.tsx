
import Link from 'react-router';
import { paths } from '@/config/paths';

import GoBag from '@/assets/school-bag.png';
import Refresher from '@/assets/light-bulb.png';
import Leaderboard from '@/assets/podium.png';
import Logo from '@/public/logo.png';

function App() {

  return (
    <>
      <div className="min-h-screen scroll-smooth bg-white text-[#2A4362]">
        <div className="scroll-smooth flex flex-col items-center max-w-screen p-5 gap-8">
        {/* Hero Section */}
        <div id="top" className="hero max-h-screen min-w-screen">
          <div className="hero-overlay bg-white"></div>
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="mb-5 text-5xl font-bold">Make your household disaster-ready.</h1>
              <p className="mb-5 text-[#4B5563]">
                <b>PrepPAL</b> is a web application that helps households get disaster-ready through personalized checklists, 
                reminders, and short learning modules. 
              </p>
              {/* Redirect to Login / Registration */}
              <Link 
                  to={paths.auth.register.getHref(redirectTo)} 
                  className="btn btn-wide border-none bg-[#2A4362] !text-white rounded-box text-lg p-6 mb-2"
                >
                  Get Started
                </Link>
              <p className="text-10 text-[#4B5563]">Already an Existing User? 
                  <Link 
                    to={paths.auth.login.getHref(redirectTo)} 
                    className="!text-[#4B5563] font-bold"
                  >
                    Log In
                  </Link>
              </p>
            </div>
          </div> 
        </div>

        {/* Features */}
        <div id="features" className="flex flex-col max-w-screen gap-4 items-center overflow-x-hidden">
          <h1 className="mt-6 text-xl font-bold">Features</h1>
          <p className="mb-2 justify-center text-center text-[#4B5563]">
              PrepPAL is not only for the household,<br/>
              but also for the community.
          </p>
          <div className="w-full max-w-md px-4">
            <div className="carousel carousel-center w-full rounded-box scroll-smooth">
              {/* Feature 1 */}
              <div id="feat-1" className="carousel-item w-full card bg-white flex-shrink-0 text-center">
                <figure>
                <img
                    src={GoBag}
                    alt="1" 
                  />
                </figure>
                <div className="card-body justify-center items-center text-center">
                  <h2 className="card-title">Track Your Go Bag</h2>
                  <p>Track your go bag items and complete your inventory with your community.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div id="feat-2" className="carousel-item w-full card bg-white flex-shrink-0 text-center">
                <figure>
                <img
                    src={Refresher}                    
                    alt="2" 
                  />
                </figure>
                <div className="card-body justify-center items-center text-center">
                  <h2 className="card-title text-center">Refresher Modules</h2>
                  <p>Brush up on the DOs and DONTs of disaster preparedness and management.</p>
                </div>
              </div>
                
              {/* Feature 3 */}
              <div id="feat-3" className="carousel-item w-full card bg-white flex-shrink-0 text-center">
                <figure>
                  <img
                      src={Leaderboard}                      
                      alt="3" 
                    />
                </figure>
                <div className="card-body justify-center items-center text-center">
                  <h2 className="card-title text-center">Leaderboards</h2>
                  <p>Get in touch with your community and see the collective progress to being disaster-ready.</p>
                </div>
              </div>
            </div>  
            
            {/* Navigation Buttons */}
            <div className="flex w-full justify-center gap-2 py-2 w-80">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  /* Added 'btn' and 'border-none' */
                  className="btn !bg-[#2A4362] !text-white border-none"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`feat-${num}`)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest', 
                      inline: 'center'
                    });
                  }}
                >
                  {num}
              </button>
              ))}
            </div> 
          </div>
        </div>   

        {/* Why It Matters */}
        <div className="flex flex-col items-center max-w-120">
          <h1 className="mb-5 mt-8 text-5xl font-bold text-center">Why It Matters</h1>
          <p className="text-center">
            By being prepared with go bags and safety knowledge, individuals and households can respond 
            quickly and effectively. <br/><br/> 
            It also strengthens community resilience, ensuring that local governments 
            can provide timely support and recovery.<br/><br/> 
            Join the PrepPAL community now!
          </p>
          <div className="flex items-center mt-8">
            <img
              src={Logo}
              alt="PrepPAL logo"
              width="80px"
            />
            <h1 className="mb-5 mt-6 text-5xl font-bold text-center">PrepPAL</h1>
            <a href="#top" className="text-xs text-center !text-[#4B5563]">Back to Top</a>
          </div>
        </div> 

      </div>

      </div>
    </>
  )
}

export default App
