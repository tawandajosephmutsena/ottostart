# OttoStart API Reference

This document describes the internal API endpoints used by the OttoStart application.

## Authentication

All admin routes require authentication via Laravel's session-based authentication. Protected routes use the `auth` and `admin` middleware.

## Public Routes

### Home

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/` | `HomeController@index` | Home page |

### Services

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/services` | `ServiceController@index` | List all services |
| GET | `/services/{slug}` | `ServiceController@show` | Single service details |

### Portfolio

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/portfolio` | `PortfolioController@index` | List all portfolio items |
| GET | `/portfolio/{slug}` | `PortfolioController@show` | Single portfolio item |

### Blog

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/blog` | `BlogController@index` | List all blog posts |
| GET | `/blog/{slug}` | `BlogController@show` | Single blog post |

### Contact

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/contact` | Inertia | Contact page |
| POST | `/contact` | `ContactController@store` | Submit contact form (rate limited: 5/min) |

### SEO & Discovery

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/sitemap.xml` | `SitemapController@index` | XML sitemap |
| GET | `/robots.txt` | Inline | Robots.txt with AI crawler rules |
| GET | `/llms.txt` | `LlmsController@index` | LLM content discovery |

---

## Admin Routes

All admin routes are prefixed with `/admin` and require authentication.

### Dashboard

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin` | `AdminController@index` | Admin dashboard |

### Pages (CMS)

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/pages` | `PageController@index` | List pages |
| GET | `/admin/pages/create` | `PageController@create` | Create page form |
| POST | `/admin/pages` | `PageController@store` | Store new page |
| GET | `/admin/pages/{id}/edit` | `PageController@edit` | Edit page form |
| PUT | `/admin/pages/{id}` | `PageController@update` | Update page |
| DELETE | `/admin/pages/{id}` | `PageController@destroy` | Delete page |

### Portfolio

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/portfolio` | `PortfolioController@index` | List portfolio items |
| GET | `/admin/portfolio/create` | `PortfolioController@create` | Create form |
| POST | `/admin/portfolio` | `PortfolioController@store` | Store new item |
| GET | `/admin/portfolio/{id}/edit` | `PortfolioController@edit` | Edit form |
| PUT | `/admin/portfolio/{id}` | `PortfolioController@update` | Update item |
| DELETE | `/admin/portfolio/{id}` | `PortfolioController@destroy` | Delete item |

### Services

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/services` | `ServiceController@index` | List services |
| GET | `/admin/services/create` | `ServiceController@create` | Create form |
| POST | `/admin/services` | `ServiceController@store` | Store new service |
| GET | `/admin/services/{id}/edit` | `ServiceController@edit` | Edit form |
| PUT | `/admin/services/{id}` | `ServiceController@update` | Update service |
| DELETE | `/admin/services/{id}` | `ServiceController@destroy` | Delete service |

### Insights (Blog)

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/insights` | `InsightController@index` | List blog posts |
| GET | `/admin/insights/create` | `InsightController@create` | Create form |
| POST | `/admin/insights` | `InsightController@store` | Store new post |
| GET | `/admin/insights/{id}/edit` | `InsightController@edit` | Edit form |
| PUT | `/admin/insights/{id}` | `InsightController@update` | Update post |
| DELETE | `/admin/insights/{id}` | `InsightController@destroy` | Delete post |

### Media Library

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/media` | `MediaController@index` | List media files |
| POST | `/admin/media` | `MediaController@store` | Upload file |
| DELETE | `/admin/media/{id}` | `MediaController@destroy` | Delete file |

### Navigation Menus

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/menus` | `MenuController@index` | Menu builder |
| PUT | `/admin/menus/{id}` | `MenuController@update` | Update menu |
| POST | `/admin/menus/{id}/items` | `MenuController@storeItem` | Add menu item |
| DELETE | `/admin/menus/{id}/items/{itemId}` | `MenuController@destroyItem` | Remove item |
| POST | `/admin/menus/{id}/items/reorder` | `MenuController@reorder` | Reorder items |
| POST | `/admin/menus/{id}/reset` | `MenuController@reset` | Reset to default |

### Team Members

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/team` | `TeamMemberController@index` | List members |
| GET | `/admin/team/create` | `TeamMemberController@create` | Create form |
| POST | `/admin/team` | `TeamMemberController@store` | Store member |
| GET | `/admin/team/{id}/edit` | `TeamMemberController@edit` | Edit form |
| PUT | `/admin/team/{id}` | `TeamMemberController@update` | Update member |
| DELETE | `/admin/team/{id}` | `TeamMemberController@destroy` | Delete member |

### Contact Inquiries

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/inquiries` | `ContactInquiryController@index` | List inquiries |
| GET | `/admin/inquiries/{id}` | `ContactInquiryController@show` | View inquiry |
| DELETE | `/admin/inquiries/{id}` | `ContactInquiryController@destroy` | Delete inquiry |

### SEO Tools

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/seo` | `SeoAnalysisController@index` | SEO dashboard |
| POST | `/admin/seo/analyze` | `SeoAnalysisController@analyze` | Analyze page SEO |
| GET | `/admin/image-seo` | `ImageSeoController@index` | Image SEO overview |

### Settings

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/settings` | `SettingsController@index` | Site settings |
| PUT | `/admin/settings` | `SettingsController@update` | Update settings |

### Plugins

| Method | Endpoint | Controller | Description |
| ------ | -------- | ---------- | ----------- |
| GET | `/admin/plugins` | `PluginController@index` | List plugins |
| POST | `/admin/plugins/{module}/toggle` | `PluginController@toggle` | Enable/disable plugin |

---

## Request/Response Format

### Contact Form Submission

**Request:**
```json
POST /contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello...",
  "phone": "+1234567890"
}
```

**Response (Inertia redirect with flash message)**

### Media Upload

**Request:**
```
POST /admin/media
Content-Type: multipart/form-data

file: (binary)
alt_text: "Image description"
```

**Response:**
```json
{
  "id": 1,
  "filename": "image.jpg",
  "url": "/storage/media/image.jpg",
  "alt_text": "Image description",
  "mime_type": "image/jpeg",
  "size": 102400
}
```

---

## Error Responses

All errors follow Laravel's standard error response format:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

## Rate Limiting

| Endpoint | Limit |
| -------- | ----- |
| POST `/contact` | 5 requests per minute |
| General API | 60 requests per minute |

## CSRF Protection

All POST, PUT, and DELETE requests require a valid CSRF token via the `X-XSRF-TOKEN` header or `_token` form field.
