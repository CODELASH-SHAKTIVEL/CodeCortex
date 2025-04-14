import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
export default async function Home() {
  return( 
    <>
  <Button>CLick Me</Button>
  <SignInButton/>
    </>
)
}