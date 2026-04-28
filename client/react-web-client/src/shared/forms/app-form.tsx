import { Button, Checkbox, DatePicker, Form, Input, Select } from "antd";
import { Controller, type Control } from "react-hook-form";

interface FormItem {
  type: string;
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValues?: any;
  options?: { label: string; value: string }[];
}

export interface FooterButton {
  text: string;
  onClick?: () => void;
  type?: "primary" | "default" | "dashed" | "text" | "link";
  htmlType?: "button" | "submit" | "reset";
  disabled?: boolean;
}

interface FormProps {
  handleSubmit?: () => void;
  formItems: FormItem[];
  footerButtons?: FooterButton[];
  formClassName: string;
  layout?: "vertical" | "inline" | "horizontal";
  control: Control<any>;
}

function AppForm({
  handleSubmit,
  formItems,
  formClassName,
  layout,
  control,
  footerButtons,
}: FormProps) {
  return (
    <Form
      onFinish={handleSubmit}
      layout={layout}
      className={`app-form-${formClassName}`}
    >
      {formItems.map((item) => (
        <Form.Item label={item.label}>
          <Controller
            name={item.name}
            control={control}
            render={({ field }) => {
              switch (item.type) {
                case "text":
                case "email":
                case "password":
                  return <Input {...field} />;
                case "number":
                  return <Input type="number" {...field} />;

                case "textarea":
                  return <Input.TextArea {...field} />;

                case "select":
                  return (
                    <Select
                      {...field}
                      options={item.options}
                      //   onChange={(val) => controllerField.onChange(val)}
                    />
                  );

                case "checkbox":
                  return (
                    <Checkbox
                      checked={field.value}
                      //   onChange={(e) =>
                      //     controllerField.onChange(e.target.checked)
                      //   }
                    >
                      {item.name}
                    </Checkbox>
                  );

                case "date":
                  return (
                    <DatePicker
                    //   {...props}
                    //   onChange={(date) => controllerField.onChange(date)}
                    />
                  );
                default:
                  return <></>;
              }
            }}
          />
        </Form.Item>
      ))}
      {footerButtons && (
        <Form.Item>
          {footerButtons.map((btn) => (
            <Button
              key={btn.text}
              type={btn.type || "primary"}
              onClick={btn.onClick}
              disabled={btn.disabled}
            >
              {btn.text}
            </Button>
          ))}
        </Form.Item>
      )}
    </Form>
  );
}

export default AppForm;
