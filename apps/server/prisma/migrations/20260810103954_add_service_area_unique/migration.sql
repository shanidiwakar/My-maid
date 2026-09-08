/*
  Warnings:

  - A unique constraint covering the columns `[cityId,name]` on the table `ServiceArea` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ServiceArea_cityId_name_key" ON "ServiceArea"("cityId", "name");
