export default async function ServicesPage() {
  const response = await fetch(
    "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/services",
  );
  const servicesResponse = await response.json();
  const services = Array.isArray(servicesResponse?.data)
    ? servicesResponse.data
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
    </div>
  );
}
