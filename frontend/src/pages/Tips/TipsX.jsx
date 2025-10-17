import React, { useState, useEffect, useRef } from 'react';
import { 
  PartyPopper, 
  FileText, 
  UtensilsCrossed, 
  Wifi, 
  FlaskConical, 
  Coffee,
  PenTool,
  BookOpen,
  CheckCircle,
  MapPin,
  Percent,
  TrendingUp,
  GraduationCap,
  Target,
  Rocket
} from 'lucide-react';
import './TipsX.css';

const TipsX = () => {
  const [visibleTips, setVisibleTips] = useState(new Set());
  const observerRef = useRef(null);
  const tipRefs = useRef([]);

  const tips = [
    {
      id: 1,
      title: "Best Party Spot",
      content: "Star Drive offers exclusive GVP student discounts of 10-15% on all events and celebrations.",
      icon: PartyPopper,
      category: "Entertainment"
    },
    {
      id: 2,
      title: "Free A4 Sheets",
      content: "Access complimentary stationery from faculty cabins and laboratory areas after internal examinations.",
      icon: FileText,
      category: "Academic"
    },
    {
      id: 3,
      title: "Best Budget Biryani",
      content: "Dum Safar & Paradise restaurants near Madhurawada offer authentic biryani at student-friendly prices.",
      icon: UtensilsCrossed,
      category: "Food"
    },
    {
      id: 4,
      title: "Free Wi-Fi Access",
      content: "Connect to complimentary Wi-Fi networks available in the Library and ECE block staff areas.",
      icon: Wifi,
      category: "Technology"
    },
    {
      id: 5,
      title: "Lab Experiment Support",
      content: "Seek assistance from senior students or lab assistants when experiments require troubleshooting.",
      icon: FlaskConical,
      category: "Academic"
    },
    {
      id: 6,
      title: "Best Campus Snacks",
      content: "Fresh Maggi noodles available daily at 4 PM from the Mechanical block food counter.",
      icon: Coffee,
      category: "Food"
    },
    {
      id: 7,
      title: "Record Completion Strategy",
      content: "Utilize senior student records as reference templates while maintaining academic integrity.",
      icon: PenTool,
      category: "Academic"
    },
    {
      id: 8,
      title: "Library Fine Prevention",
      content: "Maximize book renewal options through coordinated account management with classmates.",
      icon: BookOpen,
      category: "Academic"
    },
    {
      id: 9,
      title: "Attendance Management",
      content: "Coordinate with study groups to maintain consistent class participation records.",
      icon: CheckCircle,
      category: "Academic"
    },
    {
      id: 10,
      title: "Recreational Spots",
      content: "Rushikonda Beach, MVP street food, and CCD provide excellent relaxation venues.",
      icon: MapPin,
      category: "Entertainment"
    },
    {
      id: 11,
      title: "Student Discounts",
      content: "Leverage your GVP email ID for exclusive discounts on Amazon, Swiggy, and Zomato platforms.",
      icon: Percent,
      category: "Savings"
    },
    {
      id: 12,
      title: "Internal Assessment Strategy",
      content: "Early submissions combined with confident presentations significantly enhance internal scores.",
      icon: TrendingUp,
      category: "Academic"
    }
  ];

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tipId = parseInt(entry.target.dataset.tipId);
            setVisibleTips(prev => new Set([...prev, tipId]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    tipRefs.current.forEach((ref) => {
      if (ref) observerRef.current.observe(ref);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const setTipRef = (el, index) => {
    tipRefs.current[index] = el;
  };

  return (
    <div className="tips-container">
      {/* Professional Header */}
      <div className="header">
        <div className="header-overlay"></div>
        
        {/* Subtle background pattern */}
        <div className="header-pattern">
          <div className="header-skew"></div>
        </div>
        
        <div className="header-content">
          <div className="header-badge">
            <span className="badge-text">Academic Excellence Guide</span>
          </div>
          
          <h1 className="header-title">
            GVP Smart Tips
            <span className="header-subtitle">
              B.Tech First Year Success Guide
            </span>
          </h1>
          
          <p className="header-description">
            Essential insights and strategies curated by senior students to help you excel in your academic journey at Gayatri Vidya Parishad College of Engineering.
          </p>
        </div>
      </div>

      {/* Tips Section */}
      <div className="tips-section">
    

        <div className="tips-grid">
          {tips.map((tip, index) => (
            <div
              key={tip.id}
              ref={(el) => setTipRef(el, index)}
              data-tip-id={tip.id}
              className={`tip-wrapper ${
                visibleTips.has(tip.id) ? 'visible' : 'hidden'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="tip-group">
                {/* Card */}
                <div className="tip-card">
                  
                  {/* Category badge */}
                  <div className="category-badge">
                    <span className={`badge ${tip.category.toLowerCase()}`}>
                      {tip.category}
                    </span>
                  </div>

                  {/* Tip number */}
                  <div className="tip-number">
                    <span>#{tip.id}</span>
                  </div>

                  {/* Content */}
                  <div className="tip-content">
                    {/* Icon */}
                    <div className="tip-icon">
                      <tip.icon strokeWidth={1.5} />
                    </div>

                    {/* Title */}
                    <h3 className="tip-title">
                      {tip.title}
                    </h3>

                    {/* Description */}
                    <p className="tip-description">
                      {tip.content}
                    </p>
                  </div>

                  {/* Hover effect accent */}
                  <div className="hover-accent"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <div className="cta-container">
            {/* Background decoration */}
            <div className="cta-decoration">
              <div className="decoration-circle-1"></div>
              <div className="decoration-circle-2"></div>
            </div>
            
            <div className="cta-content">
              <h3 className="cta-title">Ready to Excel at GVP?</h3>
              <p className="cta-description">
                These tips have been tested and proven by successful seniors. Apply them wisely and make the most of your college experience.
              </p>            
              
              {/* Additional professional touch */}
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipsX;