import { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import styles from './Landing.module.css';

interface StepCard {
  id: number;
  title: string;
  description: string;
  image: string;
}

// 환경변수를 사용한 이미지 URL 생성
const getImageUrl = (imagePath: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  // 프로덕션에서는 baseUrl이 빈 문자열이므로 상대 경로 사용
  return baseUrl ? `${baseUrl}${imagePath}` : imagePath;
};

const STEPS: StepCard[] = [
  {
    id: 0,
    title: "프로젝트 소개",
    description: "Patrol 프로젝트는 등기정보조회를 통해 전월세 보증금을 지키는데 더 빠르게 선조치될 수 있도록 안내드리는 서비스입니다. 등기정보를 등록해주시면 매일 한번씩 등기정보를 조회 해 대출이 발생하거나 소유자가 변경된 경우 메일로 안내드립니다.",
    image: getImageUrl("/img/example1.png")
  },
  {
    id: 1,
    title: "주소검색",
    description: "부동산 등기부등본이 존재하는 주소를 입력해주세요.",
    image: getImageUrl("/img/example2.png")
  },
  {
    id: 2,
    title: "주소선택",
    description: "검색된 주소중 맞는 주소를 선택해주세요.",
    image: getImageUrl("/img/example3.png")
  },
  {
    id: 3,
    title: "소유자명입력",
    description: "부동산 소유자명을 입력해주세요. 등기부등본을 확인하시거나 건축물대장을 확인하시면 전체 소유자명 확인이 가능합니다.",
    image: getImageUrl("/img/example4.png")
  },
  {
    id: 4,
    title: "등기정보확인",
    description: "검색된 등기정보를 확인해주세요.",
    image: getImageUrl("/img/example5.png")
  },
  {
    id: 5,
    title: "스케줄등록",
    description: "저장된 등기정보를 스케줄로 등록해주세요. 매일 1번씩 등기정보를 조회해서 변경사항이 발생하면 메일로 알려드립니다.",
    image: getImageUrl("/img/example6.png")
  }
];

export const Landing = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1); // 초기에는 카드 숨김

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      
      // 전체 스크롤 진행도 (0-1)
      const progress = Math.min(scrollPosition / documentHeight, 1);
      setScrollProgress(progress);
      
      // 히어로 섹션이 서서히 어두워지면서 카드 나타나기
      const heroFadeThreshold = 0.2; // 20% 스크롤 후부터 카드 시작
      
      if (progress > heroFadeThreshold) {
        // 카드 영역에서의 진행도 계산 - 6개 카드 모두 표시
        const cardProgress = (progress - heroFadeThreshold) / (1 - heroFadeThreshold);
        // 0에서 5까지 (6개 카드) 순서대로 표시되도록
        const newStep = Math.min(
          Math.floor(cardProgress * (STEPS.length + 1)), // +1로 마지막 카드까지 확실히 보이게
          STEPS.length - 1
        );
        
        if (newStep !== currentStep) {
          setCurrentStep(newStep);
        }
      } else {
        setCurrentStep(-1); // 아직 카드 표시하지 않음
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentStep]);

  return (
    <div className={styles.landingContainer}>
      {/* 고정된 히어로 섹션 */}
      <div 
        className={styles.heroSection}
        style={{
          '--scroll-progress': Math.min(scrollProgress * 3, 1) // 적당한 속도로 어두워짐
        } as React.CSSProperties}
      >
        {/* 어둠 오버레이를 먼저 배치 */}
        <div className={styles.heroOverlay}></div>
        
        <Layout showLoginBtn>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Patrol</h1>
            <p className={styles.heroSubtitle}>
              등기정보 모니터링으로 보증금을 지키세요
            </p>
            <div className={styles.scrollIndicator}>
              <div className={styles.scrollArrow}></div>
            </div>
          </div>
        </Layout>
      </div>
      
      {/* 스크롤 스페이서 - 스크롤할 수 있는 공간 생성 */}
      <div className={styles.scrollSpacer}></div>
      
      {/* 고정된 카드 컨테이너 */}
      {currentStep >= 0 && (
        <div className={styles.cardsFixedContainer}>
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`${styles.stepCard} ${
                currentStep === index ? styles.active : ''
              } ${currentStep > index ? styles.passed : ''}`}
            >
              <div className={styles.cardContent}>
                <div className={styles.textSection}>
                  <h2 className={styles.stepTitle}>
                    {step.id + 1}. {step.title}
                  </h2>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
                <div className={styles.imageSection}>
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className={styles.stepImage}
                    onError={(e) => {
                      console.log('❌ 이미지 로드 실패:', step.image, e);
                      (e.target as HTMLImageElement).style.backgroundColor = '#ff4444';
                      (e.target as HTMLImageElement).style.border = '3px solid red';
                    }}
                    onLoad={(e) => {
                      console.log('✅ 이미지 로드 성공:', step.image);
                      (e.target as HTMLImageElement).style.backgroundColor = 'transparent';
                      (e.target as HTMLImageElement).style.border = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};