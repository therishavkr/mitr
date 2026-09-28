let facultyData = [];

    const facultyContainer =
      document.querySelector("#faculty-container");

    const searchInput =
      document.querySelector("#faculty-search");

    const departmentFilter =
      document.querySelector("#department-filter");

    const applyFiltersButton =
      document.querySelector("#apply-filters");

    // faculty.json stores the short department code, which is all the badge on
    // the photo needs. The line under the name spells it out via the shared
    // departments.js, so the card isn't just repeating the code and the
    // "Faculty Coordinators" heading back at the reader.


    /*
      Your images are in the same folder as directory.html
      and faculty.json.

      The keys must exactly match the "name" values in faculty.json.
    */
    const imageMap = {
      "Thanggoulen Kipgen": "Thanggoulen Kipgen.jpg",

      "Prof. R. Jayaganthan": "Prof. R. Jayaganthan.jpg",

      "Dr. Manam Srinivasa Rao": "Dr. Manam Srinivasa Rao.png",

      "Amlan Sengupta": "Amlan Sengupta.jpg",

      "Professor G Ranga Rao": "Professor G Ranga Rao.jpg",

      "Parasuraman Swaminathan": "Parasuraman Swaminathan.jpg",

      "Shyama Prasad Das": "Shyama Prasad Das.jpg",

      "Guhan Jayaraman": "Guhan Jayaraman.png",

      "Dr. Suresh Rajendran": "Dr. Suresh Rajendran.png",

      "Boby George": "Boby George.jpg",

      "Prof. A. Arockiarajan": "Prof. A. Arockiarajan.jpg",

      "Lakshmi Narasimhan T.": "Lakshmi Narasimhan T.jpg",

      "Krishna Sivalingam": "Krishna Sivalingam.jpg",

      "Dr. Muruganandam T M": "Dr.Muruganandam T M.jpg",

      "Arshinder Kaur": "Arshinder Kaur.jpg",

      "Balaji Srinivasan": "Balaji Srinivasan.jpg",

      "Raghuram Chetty": "Raghuram Chetty.png",

      "Dillip Satapathy": "Dillip Satapathy.jpg"
    };


    function escapeHTML(value) {
      return String(value ?? "").replace(/[&<>'"]/g, (character) => {
        const characters = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        };

        return characters[character];
      });
    }


    function getImageName(person) {
      /*
        If you later add an image property to faculty.json,
        it will take priority over imageMap.
      */
      return person.image || imageMap[person.name] || "";
    }


    function renderFaculty(faculty) {
      facultyContainer.innerHTML = `
        <div class="border-t border-outline-variant/30 pt-16 mb-8 flex items-center">
          <h2 class="font-headline text-4xl text-primary">
            Faculty Coordinators
          </h2>

          <div class="h-1 flex-1 mx-8 bg-gradient-to-r from-primary/20 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          ${
            faculty.length === 0
              ? `
                <p class="col-span-full text-center py-12 text-on-surface-variant">
                  No faculty coordinators found.
                </p>
              `
              : faculty.map((person) => {
                  const name = escapeHTML(person.name);
                  const email = escapeHTML(person.email);
                  const contact = escapeHTML(person.contact);
                  const department = escapeHTML(person.department);
                  const fullDepartment = escapeHTML(
                    departmentName(person.department)
                  );

                  const originalImageName = getImageName(person);
                  const safeImage = (window.isSafeImageFile && window.isSafeImageFile(originalImageName))
                    ? originalImageName
                    : "";
                  const imagePath = safeImage
                    ? `../assets/images/faculty/${encodeURIComponent(safeImage)}`
                    : (window.MITR_PLACEHOLDER_IMG || "");
                  const mailHref = window.mailtoHref ? window.mailtoHref(person.email) : "#";
                  const phoneHref = window.telHref ? window.telHref(person.contact) : "#";

                  return `
                    <article class="coordinator-card bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-sm">

                      <div class="mb-4 aspect-square rounded-lg overflow-hidden bg-surface-container-high relative">

                              <img
                                class="w-full h-full object-cover"
                                src="${imagePath}"
                                alt="Portrait of ${name}"
                              />

                        <div class="absolute bottom-2 right-2 bg-primary text-on-primary text-[10px] px-2 py-1 rounded uppercase tracking-widest font-bold">
                          ${department}
                        </div>
                      </div>

                      <h3 class="font-headline text-2xl mb-1">
                        ${name}
                      </h3>

                      <p class="text-sm text-on-surface-variant mb-4">
                        ${fullDepartment}
                      </p>

                      <div class="flex flex-col gap-2">

                        <div class="flex items-center gap-3 text-secondary">
                          <span class="material-symbols-outlined text-sm">
                            mail
                          </span>

                          <a
                            class="text-sm truncate hover:underline"
                            href="${mailHref}"
                          >
                            ${email}
                          </a>
                        </div>

                        ${
                          contact
                            ? `
                              <div class="flex items-center gap-3 text-secondary">
                                <span class="material-symbols-outlined text-sm">
                                  call
                                </span>

                                <a
                                  class="text-sm hover:underline"
                                  href="${phoneHref}"
                                >
                                  ${contact}
                                </a>
                              </div>
                            `
                            : ""
                        }

                      </div>
                    </article>
                  `;
                }).join("")
          }
        </div>
      `;
      if (window.bindImageFallbacks) window.bindImageFallbacks(facultyContainer);
    }


    function populateDepartments() {
      const departments = [
        ...new Set(
          facultyData.map((person) => person.department)
        )
      ].sort();

      departmentFilter.innerHTML = `
        <option value="all">
          All Departments
        </option>
      `;

      departments.forEach((department) => {
        const option = document.createElement("option");

        option.value = department;
        option.textContent = department;

        departmentFilter.appendChild(option);
      });
    }


    function applyFilters() {
      const query =
        searchInput.value.trim().toLowerCase();

      const selectedDepartment =
        departmentFilter.value;

      const filteredFaculty = facultyData.filter((person) => {
        // Both forms, so the code in the badge and the spelled-out name on the
        // card each find the card they appear on.
        const searchableText = `
          ${person.name}
          ${person.email}
          ${person.department}
          ${departmentName(person.department)}
        `.toLowerCase();

        const matchesSearch =
          searchableText.includes(query);

        const matchesDepartment =
          selectedDepartment === "all" ||
          person.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
      });

      renderFaculty(filteredFaculty);
    }


    /*
      IMPORTANT:
      faculty.json lives in src/data (relative to pages/),
      so this path is correct.
    */
    fetch("../src/data/faculty.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Could not load faculty.json: ${response.status}`
          );
        }

        return response.json();
      })
      .then((faculty) => {
        if (!Array.isArray(faculty)) {
          throw new Error(
            "faculty.json must contain an array"
          );
        }

        facultyData = faculty;

        populateDepartments();
        renderFaculty(facultyData);
      })
      .catch((error) => {
        console.error(
          "Faculty rendering failed:",
          error
        );

        facultyContainer.innerHTML = `
          <div class="col-span-full rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p class="font-bold text-red-700">
              Failed to load faculty information.
            </p>

            <p class="text-sm text-red-600 mt-2">
              Check that faculty.json lives in src/data (relative to pages/).
            </p>

            <p class="text-xs text-red-500 mt-2">
              ${error.message}
            </p>
          </div>
        `;
      });


    searchInput.addEventListener(
      "input",
      applyFilters
    );

    departmentFilter.addEventListener(
      "change",
      applyFilters
    );

    applyFiltersButton.addEventListener(
      "click",
      applyFilters
    );
