# Finni Health Demo


## The problem

Providers are fed up with their existing patient management dashboards! They want a new and improved solution to manage their patient’s critical data. Namely, they want to track:

- Names (First, Middle, Last)
- Date of Birth
- Status (Inquiry, Onboarding, Active, Churned)
- Address

After entering in this information, providers will want to view the data.

## The Solution

Please build a web-based application using your favourite stack that accomplishes the above requirements. The architecture should consist of:

- Some sort of front-end that talks to a backend using APIs
- A database that the backend uses to store data

## More Details From Email

* Providers can be in any medical industry, physicians, surgeons, nurses, therapists, etc. Their patients are the people they care for.
* Their primary pain is around storing patient data and then easily finding patients based on this data. I.e who are all my patients in New York under the age of 45? Who are all my diabetic patients? Where does Ally Smith live?
* They will sometimes input new patients into the platform (5-10 times a week), they will often look up and edit patient data (multiple times a day)
* All of the field stated are required except Middle Name.
* (add same person) Great thinking, for this, we can just allow them to do so and assume its a different person.
* A history of edits would be amazing, but not required as a part of this takehome. We would definitely love to see it and it would give you bonus points.
* Yes correct, there is only 1 user per “instance”, ideally, you would build this so there can be multiple instances
* No need to think about security beyond basic HTTPS!

## My Solution
<img width="1512" alt="Screenshot 2025-06-29 at 12 57 48 AM" src="https://github.com/user-attachments/assets/646a46e1-1a57-436d-8460-83dee3ec7c96" />
<img width="1505" alt="Screenshot 2025-06-29 at 12 58 11 AM" src="https://github.com/user-attachments/assets/74d9b0e1-5d1f-4515-aaf8-30bf7157c811" />
I'm excited to share what I've built. The application is a full-stack healthcare patient management platform implemented using Next.js, a Node.js API and Supabase (Postgres) database. I prioritized designing the most intuitive and beautiful user interface possible, for which I either took full advantage of Chakra-UI's pre-built capabilities or built components from scratch. I used Typescript on both the front-end and backend for type safety and performance optimizations. The app is complete with form "on-submit" and "on-typing" validation, api validation, robust HTTP responses, a history of status updates so providers can see how they've interacted with their patients' status in the past, visual loading-state feedback using toaster promises, and responsive design. 


### TODOS (Things I didn't get to)
- Login functionality! I have a many-to-one provider database  set up in postgres but I didn't get to building a sign-up/log-in page.
- Pagination! For optimization and better UI/UX experience.
- Certain optimizations: e.g. skipping the api call if no patient information has been updated.
- Filtering/Searching results!
- Address [auto-complete](https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform)!



