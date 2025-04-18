import { Button } from "@/components/ui/button";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
export default async function Home() {
  return (
    <>
      <Button>CLick Me</Button>
      <LoginLink>Sign in</LoginLink>
    </>
  )
}