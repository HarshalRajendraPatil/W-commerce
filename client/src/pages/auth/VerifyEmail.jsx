import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, reset } from '../../redux/slices/authSlice';

function VerifyEmail() {
  let { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [verifying, setVerifying] = useState(true);
  
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );
  
  useEffect(() => {
    // Verify email on component mount
    if (token) {
      dispatch(verifyEmail(token));
      token = null;
    }
    
    // Redirect after successful verification
    if (isSuccess) {
      setVerifying(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    
    if (isError) {
      setVerifying(false);
    }
    
    // Reset state on unmount
    return () => {
      dispatch(reset());
    };
  }, [token, isSuccess, isError, navigate, dispatch]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Email Verification
        </h2>
        
        {verifying && (
          <div className="py-4">
            <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Verifying your email address...</p>
          </div>
        )}
        
        {isSuccess && !verifying && (
          <div className="py-4">
            <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mt-4">Email Verified!</h3>
            <p className="text-gray-600 mt-2">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
        
        {isError && (
          <div className="py-4">
            <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mt-4">Verification Failed</h3>
            <p className="text-gray-600 mt-2">
              {message || 'The verification link is invalid or has expired.'}
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail; 