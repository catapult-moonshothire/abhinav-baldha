import MainContainer from "@/components/layout/main-container";
import BlogListPage from "../../components/blog-posts";
import Header from "@/components/layout/header";

export default function Home() {
  return (
    <>
      <Header />
      <MainContainer>
        <BlogListPage />
      </MainContainer>
    </>
  );
}
