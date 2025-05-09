import { useLocation, useNavigate } from 'react-router-dom';

export function usePersistentLocationState() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateWithState = (to, state) => {
    navigate(to, { state });
  };

  return { navigateWithState, location };
}
