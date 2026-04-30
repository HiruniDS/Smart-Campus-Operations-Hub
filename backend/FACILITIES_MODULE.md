# Facilities Module - Clean Architecture Documentation

## Overview
The Facilities module implements a clean, enterprise-grade architecture with proper separation of concerns using DTOs, mappers, and services.

## Project Structure

```
com.cliauth
├── model
│   └── Facility.java                    # JPA Entity (MongoDB Document)
├── dto
│   ├── CreateFacilityDTO.java           # DTO for creating facilities
│   ├── UpdateFacilityDTO.java           # DTO for updating facilities
│   └── FacilityResponseDTO.java         # DTO for API responses
├── mapper
│   └── FacilityMapper.java              # Maps between Entity and DTOs
├── repository
│   └── FacilityRepository.java          # MongoDB Repository
├── service
│   └── FacilityService.java             # Business logic layer
├── controller
│   └── FacilityController.java          # REST API endpoints
└── exception
    ├── FacilityNotFoundException.java    # Custom exception
    └── FacilityValidationException.java  # Custom exception
```

## Layer Descriptions

### 1. Model Layer (Entity)
**File**: `com/cliauth/model/Facility.java`

Represents the MongoDB document with all facility properties.

```java
@Document(collection = "facilities")
public class Facility {
    @Id private String id;
    private String name;
    private String type;
    private String location;
    private Integer capacity;
    private String status;
    private String description;
    private String image;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 2. DTO Layer (Data Transfer Objects)

#### CreateFacilityDTO
**File**: `com/cliauth/dto/CreateFacilityDTO.java`

Used for creating new facilities. Includes validation annotations.

```java
public class CreateFacilityDTO {
    @NotBlank private String name;
    @NotBlank private String type;
    @NotBlank private String location;
    @NotNull @Min(1) private Integer capacity;
    @NotBlank private String status;
    @NotBlank private String description;
    private String image;
    @NotBlank private String createdBy;
}
```

#### UpdateFacilityDTO
**File**: `com/cliauth/dto/UpdateFacilityDTO.java`

Used for partial updates. All fields are optional.

```java
public class UpdateFacilityDTO {
    private String name;
    private String type;
    private String location;
    @Min(1) private Integer capacity;
    private String status;
    private String description;
    private String image;
}
```

#### FacilityResponseDTO
**File**: `com/cliauth/dto/FacilityResponseDTO.java`

Used for API responses. Includes timestamps and complete facility information.

```java
public class FacilityResponseDTO {
    private String id;
    private String name;
    private String type;
    private String location;
    private Integer capacity;
    private String status;
    private String description;
    private String image;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 3. Mapper Layer
**File**: `com/cliauth/mapper/FacilityMapper.java`

Converts between entities and DTOs.

**Methods**:
- `toFacility(CreateFacilityDTO)` - Create entity from DTO
- `toResponseDTO(Facility)` - Convert entity to response DTO
- `updateFacilityFromDTO(UpdateFacilityDTO, Facility)` - Apply updates to entity

### 4. Repository Layer
**File**: `com/cliauth/repository/FacilityRepository.java`

MongoDB repository with custom query methods.

```java
public interface FacilityRepository extends MongoRepository<Facility, String> {
    List<Facility> findAllByOrderByCreatedAtDesc();
    List<Facility> findByStatus(String status);
    List<Facility> findByType(String type);
    List<Facility> findByCreatedBy(String createdBy);
}
```

### 5. Service Layer (Business Logic)
**File**: `com/cliauth/service/FacilityService.java`

Implements all CRUD operations with DTOs.

**CRUD Methods**:
```
CREATE
├── createFacility(CreateFacilityDTO) → FacilityResponseDTO

READ
├── getAllFacilities() → List<FacilityResponseDTO>
├── getFacilityById(String id) → Optional<FacilityResponseDTO>
├── getFacilitiesByStatus(String status) → List<FacilityResponseDTO>
├── getActiveFacilities() → List<FacilityResponseDTO>
├── getFacilitiesByType(String type) → List<FacilityResponseDTO>
└── getFacilitiesByCreatedBy(String createdBy) → List<FacilityResponseDTO>

UPDATE
└── updateFacility(String id, UpdateFacilityDTO) → Optional<FacilityResponseDTO>

DELETE
├── deleteFacility(String id) → boolean
└── facilityExists(String id) → boolean

UTILITY
└── getFacilityCount() → long
└── getFacilityCountByStatus(String status) → long
```

### 6. Controller Layer (REST API)
**File**: `com/cliauth/controller/FacilityController.java`

REST API endpoints for facility management.

## API Endpoints

### Create
```
POST /api/facilities
Content-Type: application/json

{
  "name": "Innovation Lab",
  "type": "LAB",
  "location": "Engineering Block",
  "capacity": 28,
  "status": "ACTIVE",
  "description": "Computer lab for workshops",
  "image": "base64-encoded-image",
  "createdBy": "tech-001"
}

Response: 201 Created
{
  "id": "fac-12345",
  "name": "Innovation Lab",
  ...
  "createdAt": "2026-04-29T10:30:00",
  "updatedAt": "2026-04-29T10:30:00"
}
```

### Read All
```
GET /api/facilities
Response: 200 OK
[
  { ...facility1... },
  { ...facility2... }
]
```

### Read Active
```
GET /api/facilities/active
Response: 200 OK
[ ...active facilities... ]
```

### Read by ID
```
GET /api/facilities/{id}
Response: 200 OK or 404 Not Found
{ ...facility... }
```

### Read by Status
```
GET /api/facilities/by-status/{status}
Response: 200 OK
[ ...facilities with status... ]
```

### Read by Type
```
GET /api/facilities/by-type/{type}
Response: 200 OK
[ ...facilities of type... ]
```

### Read by Creator
```
GET /api/facilities/created-by/{createdBy}
Response: 200 OK
[ ...facilities created by user... ]
```

### Update
```
PUT /api/facilities/{id}
Content-Type: application/json

{
  "name": "Updated Lab Name",
  "capacity": 30,
  "status": "ACTIVE"
}

Response: 200 OK
{ ...updated facility... }
```

### Delete
```
DELETE /api/facilities/{id}
Response: 204 No Content
```

### Statistics
```
GET /api/facilities/meta/stats
Response: 200 OK
{
  "total": 10,
  "active": 8,
  "outOfService": 2
}
```

## Exception Handling

### Custom Exceptions
- `FacilityNotFoundException` - Facility not found (404)
- `FacilityValidationException` - Validation error (400)

### Validation
DTOs use Jakarta Validation annotations:
- `@NotBlank` - Required string field
- `@NotNull` - Required field
- `@Min` - Minimum value constraint
- `@Valid` - Nested validation

## Error Responses

```json
{
  "timestamp": "2026-04-29T10:30:00",
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "name": "Facility name is required",
    "capacity": "Capacity must be at least 1"
  }
}
```

## Design Patterns Used

1. **Repository Pattern** - Abstraction over data access
2. **DTO Pattern** - Decouple API from entity model
3. **Mapper Pattern** - Convert between entities and DTOs
4. **Service Pattern** - Business logic encapsulation
5. **Controller Pattern** - HTTP request handling
6. **Exception Handler Pattern** - Centralized error handling

## Benefits of This Architecture

- ✅ **Separation of Concerns** - Each layer has a single responsibility
- ✅ **Reusability** - DTOs can be reused across multiple controllers
- ✅ **Maintainability** - Easy to modify logic without affecting API
- ✅ **Testability** - Services can be easily unit tested
- ✅ **Validation** - Centralized input validation
- ✅ **Error Handling** - Consistent error responses
- ✅ **Scalability** - Easy to add new features or endpoints

## Build & Compilation

```bash
# Compile the module
mvn clean compile

# Build the entire project
mvn clean package

# Run tests
mvn test
```

## Dependencies

- Spring Boot 3.x
- MongoDB
- Jakarta Validation
- Jackson (JSON serialization)
