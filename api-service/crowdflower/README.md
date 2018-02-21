# CrowdFlower Integration

## Setup
Steps to run a [CrowdFlower](http://www.crowdflower.com/) job using Crowd 9 interface.

1. **Deploy the Crowd 9 app.** Follow [these steps](/api-service#pre-requisits) to run a hosted instance of the Crowd 9 app.

2. **Create a new Crowd 9 job.** Add a new entry to the `client_jobs` table corresponding to the job you want to run. You can either use the admin [API](/api-service/api-server#api) or add the data directly to the database. You can then use the API to add questions for the job.

3. **Create a new CrowdFlower job.** In the Design tab, choose to use custom CSS/JS and paste in the code in the `crowdflower.js` file in this directory. The code loads the Crowd 9 interface using an iFrame, listens for a message from the Crowd 9 app when an annotation is added and updates the value of a hidden CML input with the data from the annoation.

4. **Add data.** Create a CSV with fields `question_id` and `client_job_key`. The `question_id` should correspond to the unique ID for each question in your job that you want to annotate. The `client_job_key` should correspond to the job in the `client_jobs` table.

Your data should look something like this:

```
question_id,client_job_key
004ba3a74c7c5a1147aab625f0f705d4955df2d229d39c123332fe4893c44072,1k-demo-ptoxic
0076d1e1b9815a53ade444d4a69f72de72fca05cb356305ab32841cc4c88e61e,1k-demo-ptoxic
0089f96a9762963cba9e00dffecfd1ccd8a97749b1d9df286ecf7e1de0366102,1k-demo-ptoxic
0094596235a5f9288d388f1a649db5190a1212a16a759d04db5c84fea239bf59,1k-demo-ptoxic
...
```

You are now ready to launch the job!

## Validation
There are a few ways to validate that your job is set up correctly. The easiest way is to use the CrowdFlower preview feature and check that the annotation you make are showing up in the `answers` table in Spanner.

To validate the end-to-end data flow in a near production environment, you can launch the job without openning it up for external users. You will get a sharable link to test the job which will function just like a regular CrowdFlower job. To do this, go to the Launch tab, and in Settings, uncheck the External checkbox under the Contributors section. Then launch the job for a handful of rows. You can use the sharable link to run through the job and verify that the annotated data is appearing in the CrowdFlower interface.

## Potential Issues
* There is a unique constraint in the `answers` table that doesn't allow the same user to annotate the same question more than once. As a result, you may get 500 errors from `/api/answer/1k-demo-ptoxic` while testing. You can fix this by deleting test answers from the database, just don't delete real data!