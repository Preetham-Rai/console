import { Button, Card, Form, Input } from "antd";
import { loginSchema, type loginFormData } from "./services/schema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const { Meta } = Card;

function Login() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<loginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: any) => {
    console.log("Submitted", data);
  };

  return (
    <Card className="login-card" hoverable={true}>
      <Meta
        title="Login"
        style={{
          textAlign: "center",
        }}
      />
      <div style={{ height: "20px" }}></div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Email"
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input {...field} type="email" placeholder="Enter your email" />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Password"
          validateStatus={errors.password ? "error" : ""}
          help={errors.password?.message}
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                placeholder="Enter you password"
              />
            )}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" block htmlType="submit" shape="default">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default Login;
