export default async function HomePage() {
  const response = await fetch(
    "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/services",
  );
  const servicesResponse = await response.json();
  const services = Array.isArray(servicesResponse?.data)
    ? servicesResponse.data
    : [];

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
        {services.map((service: any) => (
          <div key={service.id}>
            <h2>Name: {service.serviceName}</h2>
            <p>Description: {service.description}</p>
            <p>Price: ${service.basePrice ?? service.baePrice ?? "N/A"}</p>
          </div>
        ))}
      </div>
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
