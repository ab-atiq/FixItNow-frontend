export default async function CategoriesPage() {
  const categoryResponse = await fetch(
    "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/categories",
  );
  const categoriesResponse = await categoryResponse.json();
  const categories = Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];

  return (
    <div>
      <div>
        {categories.map((category: any) => (
          <div key={category.id}>
            <h2>Category: {category.categoryName}</h2>
            <p>Description: {category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
