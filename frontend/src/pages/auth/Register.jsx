import AuthLayout from "../../components/auth/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm";

const Register = () => {
  return (
    <AuthLayout title="Create account" subtitle="Register to get started">
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
