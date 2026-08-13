import Link from "next/link";

type CategoryApiItem = {
  id: string;
  categoryName: string;
  description?: string | null;
};

export default async function CategoriesPage() {
  const response = await fetch(
    "https://ph-l2-a4-fix-it-now-backend-project-drab.vercel.app/api/categories",
    { cache: "no-store" },
  );

  const categoriesResponse = await response.json();
  const categories: CategoryApiItem[] = Array.isArray(categoriesResponse?.data)
    ? categoriesResponse.data
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="mt-2 text-gray-600">
          Explore services by category and find the right professional for every
          job.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
          No categories available right now.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/services?categoryId=${category.id}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-700">
                {category.categoryName.slice(0, 1).toUpperCase()}
              </div>

              <h2 className="text-xl font-semibold text-gray-900">
                {category.categoryName}
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {category.description ||
                  "Explore trusted services in this category."}
              </p>

              <div className="mt-5 inline-flex items-center text-sm font-medium text-primary-600 group-hover:text-primary-700">
                Browse services →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
