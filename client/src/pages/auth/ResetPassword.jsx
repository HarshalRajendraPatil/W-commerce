import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { resetPassword, reset } from '../../redux/slices/authSlice';
import FormInput from '../../components/FormInput';

// Validation schema
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoading, isSuccess } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // Redirect after successful password reset
    if (isSuccess) {
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    
    // Reset state on unmount
    return () => {
      dispatch(reset());
    };
  }, [isSuccess, navigate, dispatch]);
  
  const handleSubmit = (values) => {
    dispatch(resetPassword({
      token,
      password: values.password
    }));
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600">
            Create a new password for your account
          </p>
        </div>
        
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              <FormInput
                name="password"
                type="password"
                placeholder="New password"
                label="New Password"
                autoComplete="new-password"
              />
              
              <FormInput
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                label="Confirm New Password"
                autoComplete="new-password"
              />
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting || isSuccess}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 
                   isSuccess ? 'Password Reset!' : 
                   'Reset Password'}
                </button>
              </div>
              
              {isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Your password has been reset successfully! Redirecting to login...
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-500">
                    Back to login
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default ResetPassword; 