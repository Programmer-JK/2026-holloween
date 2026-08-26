import { useNavigate } from 'react-router-dom';
import { PixelButton } from '../components/PixelButton';
import { Ghost } from '../components/Ghost';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
      <Ghost size={80} color="#5B2A86" className="animate-float mb-8" />
      <h1 className="font-pixel text-4xl text-[#FF7A00] glow-orange mb-4">404</h1>
      <h2 className="font-pixel text-sm text-[#8B4BC0] mb-4">PAGE NOT FOUND</h2>
      <p className="font-sans text-base text-[#EDE7F6] mb-8">
        유령이 이 페이지를 가져갔어요... 👻
      </p>
      <PixelButton onClick={() => navigate('/')} variant="orange">
        🎃 BACK TO PARTY
      </PixelButton>
    </div>
  );
}
