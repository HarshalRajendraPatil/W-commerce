import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { register, reset } from '../../redux/slices/authSlice';
import FormInput from '../../components/FormInput';

// Validation schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );
  
  useEffect(() => {
    // Redirect if registered
    if (isSuccess || user) {
      navigate('/');
    }
    
    // Reset state on unmount
    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, navigate, dispatch]);
  
  const handleSubmit = (values) => {
    const { name, email, password } = values;
    dispatch(register({ name, email, password }));
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Create an Account
          </h2>
          <p className="text-gray-600">
            Join W-Commerce to start shopping
          </p>
        </div>
        
        <Formik
          initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              <FormInput
                name="name"
                type="text"
                placeholder="Full name"
                label="Full Name"
                autoComplete="name"
              />
              
              <FormInput
                name="email"
                type="email"
                placeholder="Email address"
                label="Email Address"
                autoComplete="email"
              />
              
              <FormInput
                name="password"
                type="password"
                placeholder="Password"
                label="Password"
                autoComplete="new-password"
              />
              
              <FormInput
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                label="Confirm Password"
                autoComplete="new-password"
              />
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-500">
                    Sign in
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

export default Register; 