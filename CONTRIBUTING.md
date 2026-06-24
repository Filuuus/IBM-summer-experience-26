# Contributing to CropAnalytics

Thank you for your interest in contributing to CropAnalytics! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Git Workflow](#git-workflow)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation](#documentation)
8. [Pull Request Process](#pull-request-process)
9. [Issue Reporting](#issue-reporting)
10. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Expected Behavior

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Personal or political attacks
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. Read the [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
2. Completed the [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Reviewed the [ARCHITECTURE.md](ARCHITECTURE.md)
4. Familiarized yourself with the [API_REFERENCE.md](API_REFERENCE.md)

### Setting Up Development Environment

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/IBM-summer-experience-26.git
cd IBM-summer-experience-26

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/IBM-summer-experience-26.git

# 4. Follow SETUP_GUIDE.md for complete setup
```

---

## Development Workflow

### 1. Choose an Issue

- Browse [open issues](https://github.com/ORIGINAL_OWNER/IBM-summer-experience-26/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to express interest
- Wait for assignment before starting work

### 2. Create a Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Make Changes

- Write clean, maintainable code
- Follow coding standards (see below)
- Add tests for new functionality
- Update documentation as needed

### 4. Commit Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add yield prediction endpoint"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## Coding Standards

### Python (Backend)

#### Style Guide

Follow [PEP 8](https://pep8.org/) style guide:

```python
# Good
def calculate_yield_prediction(
    temperature: float,
    precipitation: float,
    radiation: float
) -> float:
    """
    Calculate yield prediction based on environmental factors.
    
    Args:
        temperature: Average temperature in Celsius
        precipitation: Total precipitation in mm
        radiation: Solar radiation in MJ/m²
    
    Returns:
        Predicted yield in t/ha
    """
    # Implementation
    pass

# Bad
def calc_yield(t,p,r):
    return t*p*r
```

#### Naming Conventions

- **Classes**: `PascalCase` (e.g., `ProductionPredictor`)
- **Functions/Methods**: `snake_case` (e.g., `predict_yield`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_TEMPERATURE`)
- **Private methods**: `_leading_underscore` (e.g., `_validate_input`)

#### Type Hints

Always use type hints:

```python
from typing import List, Dict, Optional

def get_cycles(
    terreno_id: int,
    year: Optional[int] = None
) -> List[Dict[str, any]]:
    """Get growing cycles for a plot."""
    pass
```

#### Docstrings

Use Google-style docstrings:

```python
def train_model(X: np.ndarray, y: np.ndarray) -> None:
    """
    Train the machine learning model.
    
    Args:
        X: Feature matrix of shape (n_samples, n_features)
        y: Target values of shape (n_samples,)
    
    Raises:
        ValueError: If X and y have incompatible shapes
        
    Example:
        >>> model = ProductionPredictor()
        >>> model.train(X_train, y_train)
    """
    pass
```

#### Django Best Practices

```python
# models.py - Use verbose names and help text
class Ciclo(models.Model):
    rendimiento_materia_seca = models.FloatField(
        verbose_name="Dry Matter Yield",
        help_text="Yield in tons per hectare",
        validators=[MinValueValidator(0)]
    )
    
    class Meta:
        verbose_name = "Growing Cycle"
        verbose_name_plural = "Growing Cycles"
        ordering = ['-año', '-fecha_siembra']
        indexes = [
            models.Index(fields=['terreno', 'año']),
        ]

# views.py - Use viewsets and proper serializers
class CicloViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing growing cycles.
    
    Provides CRUD operations and custom actions for predictions.
    """
    queryset = Ciclo.objects.select_related('terreno', 'hibrido')
    serializer_class = CicloSerializer
    filterset_fields = ['año', 'terreno', 'hibrido']
    search_fields = ['terreno__nombre', 'hibrido__nombre']
    ordering_fields = ['año', 'rendimiento_materia_seca']
```

### TypeScript/Angular (Frontend)

#### Style Guide

Follow [Angular Style Guide](https://angular.io/guide/styleguide):

```typescript
// Good
export class YieldPredictionComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  protected prediction = signal<YieldPrediction | null>(null);
  protected loading = signal(false);
  
  ngOnInit(): void {
    this.loadPrediction();
  }
  
  private loadPrediction(): void {
    this.loading.set(true);
    this.apiService.getPrediction(this.cycleId)
      .pipe(
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data) => this.prediction.set(data),
        error: (err) => this.handleError(err)
      });
  }
}

// Bad
export class comp {
  data: any;
  
  getData() {
    this.apiService.get().subscribe(d => this.data = d);
  }
}
```

#### Naming Conventions

- **Components**: `PascalCase` (e.g., `YieldPredictionComponent`)
- **Services**: `PascalCase` with `Service` suffix (e.g., `ApiService`)
- **Interfaces**: `PascalCase` (e.g., `YieldPrediction`)
- **Variables/Functions**: `camelCase` (e.g., `loadPrediction`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

#### Component Structure

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-yield-prediction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './yield-prediction.component.html',
  styleUrl: './yield-prediction.component.css'
})
export class YieldPredictionComponent implements OnInit {
  // 1. Injected dependencies
  private readonly apiService = inject(ApiService);
  
  // 2. Signals and state
  protected prediction = signal<YieldPrediction | null>(null);
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  
  // 3. Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }
  
  // 4. Public methods (template)
  protected onSubmit(): void {
    // Implementation
  }
  
  // 5. Private methods
  private loadData(): void {
    // Implementation
  }
}
```

#### TypeScript Best Practices

```typescript
// Use interfaces for data structures
export interface YieldPrediction {
  rendimiento_materia_seca: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  confidence_score: number;
}

// Use enums for constants
export enum PredictionStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed'
}

// Use type guards
function isYieldPrediction(obj: any): obj is YieldPrediction {
  return obj && 
    typeof obj.rendimiento_materia_seca === 'number' &&
    typeof obj.confidence_score === 'number';
}
```

### CSS/Tailwind

```css
/* Use Tailwind utility classes in templates */
<div class="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold text-gray-800">Yield Prediction</h2>
  <p class="text-gray-600">Results will appear here</p>
</div>

/* Custom CSS only when necessary */
.custom-chart {
  @apply w-full h-64;
  /* Custom styles that can't be done with Tailwind */
  background: linear-gradient(to right, #4ade80, #22c55e);
}
```

---

## Git Workflow

### Branch Naming

- **Features**: `feature/description` (e.g., `feature/ml-predictions`)
- **Bug fixes**: `fix/description` (e.g., `fix/api-cors-error`)
- **Documentation**: `docs/description` (e.g., `docs/api-reference`)
- **Refactoring**: `refactor/description` (e.g., `refactor/database-queries`)
- **Tests**: `test/description` (e.g., `test/prediction-endpoint`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

<body>

<footer>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, etc.)
refactor: Code refactoring
test:     Adding or updating tests
chore:    Maintenance tasks

# Examples
feat(api): add yield prediction endpoint

Implement POST /api/v1/ciclos/predict_yield/ endpoint
with ML model integration and confidence intervals.

Closes #123

fix(frontend): resolve CORS error in API calls

Update CORS configuration in Django settings to allow
requests from Angular dev server.

Fixes #456

docs(readme): update setup instructions

Add detailed Docker setup steps and troubleshooting
section for common issues.
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your local main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main

# Rebase your feature branch
git checkout feature/your-feature
git rebase main
```

---

## Testing Guidelines

### Backend Testing

#### Unit Tests

```python
# tests/test_models.py
from django.test import TestCase
from crops.models import Ciclo, Terreno, Hibrido

class CicloModelTest(TestCase):
    def setUp(self):
        self.terreno = Terreno.objects.create(
            nombre="Test Plot",
            elevacion=1500.0,
            area_hectareas=25.0
        )
        self.hibrido = Hibrido.objects.create(
            marca="Pioneer",
            nombre="P1234"
        )
    
    def test_ciclo_creation(self):
        """Test creating a growing cycle."""
        ciclo = Ciclo.objects.create(
            terreno=self.terreno,
            hibrido=self.hibrido,
            año=2025,
            fecha_siembra="2025-04-15",
            fecha_cosecha="2025-09-10"
        )
        self.assertEqual(ciclo.terreno, self.terreno)
        self.assertEqual(ciclo.año, 2025)
    
    def test_yield_calculation(self):
        """Test yield calculation method."""
        ciclo = Ciclo.objects.create(
            terreno=self.terreno,
            hibrido=self.hibrido,
            rendimiento_fresco=50.0,
            contenido_materia_seca=35.0
        )
        expected_yield = 50.0 * 0.35
        self.assertAlmostEqual(
            ciclo.calculate_dry_matter_yield(),
            expected_yield,
            places=2
        )
```

#### API Tests

```python
# tests/test_api.py
from rest_framework.test import APITestCase
from rest_framework import status

class CicloAPITest(APITestCase):
    def test_list_ciclos(self):
        """Test listing growing cycles."""
        response = self.client.get('/api/v1/ciclos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_predict_yield(self):
        """Test yield prediction endpoint."""
        data = {
            "terreno_id": 1,
            "hibrido_id": 2,
            "condiciones_esperadas": {
                "temp_media_ciclo": 22.5,
                "precipitacion_ciclo": 450
            }
        }
        response = self.client.post(
            '/api/v1/ciclos/predict_yield/',
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('prediction', response.data)
```

#### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific test file
python manage.py test crops.tests.test_models

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Frontend Testing

#### Component Tests

```typescript
// yield-prediction.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YieldPredictionComponent } from './yield-prediction.component';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

describe('YieldPredictionComponent', () => {
  let component: YieldPredictionComponent;
  let fixture: ComponentFixture<YieldPredictionComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getPrediction']);

    await TestBed.configureTestingModule({
      imports: [YieldPredictionComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(YieldPredictionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load prediction on init', () => {
    const mockPrediction = {
      rendimiento_materia_seca: 18.5,
      confidence_score: 0.92
    };
    apiService.getPrediction.and.returnValue(of(mockPrediction));

    component.ngOnInit();

    expect(apiService.getPrediction).toHaveBeenCalled();
    expect(component.prediction()).toEqual(mockPrediction);
  });
});
```

#### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Test Coverage Requirements

- **Backend**: Minimum 80% coverage
- **Frontend**: Minimum 70% coverage
- **Critical paths**: 100% coverage (ML predictions, data validation)

---

## Documentation

### Code Documentation

- Add docstrings to all public functions/methods
- Include type hints in Python code
- Add JSDoc comments for complex TypeScript functions
- Document API endpoints in API_REFERENCE.md

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Modifying dependencies
- Updating project structure

### API Documentation

Update API_REFERENCE.md when:
- Adding new endpoints
- Changing request/response formats
- Modifying authentication
- Adding new query parameters

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #(issue number)

## Testing
Describe testing performed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: At least one maintainer reviews
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges to main

### After Merge

- Delete your feature branch
- Update your local repository
- Close related issues

---

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or references
```

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions and reviews

### Getting Help

1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Contact maintainers

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## Development Tips

### Useful Commands

```bash
# Backend
python manage.py shell          # Django shell
python manage.py dbshell         # Database shell
python manage.py makemigrations  # Create migrations
python manage.py migrate         # Apply migrations
python manage.py test            # Run tests

# Frontend
ng generate component name       # Generate component
ng generate service name         # Generate service
ng build --configuration production  # Production build
ng lint                          # Run linter

# Docker
docker-compose logs -f           # View logs
docker-compose exec db psql      # Access database
docker-compose restart           # Restart services
```

### Debugging

#### Backend Debugging

```python
# Use Django Debug Toolbar (add to INSTALLED_APPS)
# Add breakpoints with pdb
import pdb; pdb.set_trace()

# Or use ipdb for better experience
import ipdb; ipdb.set_trace()

# Print SQL queries
from django.db import connection
print(connection.queries)
```

#### Frontend Debugging

```typescript
// Use Angular DevTools browser extension
// Add console logs
console.log('Debug:', variable);

// Use debugger statement
debugger;

// Check component state in template
{{ prediction() | json }}
```

---

## License

By contributing to CropAnalytics, you agree that your contributions will be licensed under the same license as the project.

---

## Questions?

If you have questions about contributing:

1. Check this guide
2. Review other documentation
3. Ask in GitHub Discussions
4. Contact maintainers

Thank you for contributing to CropAnalytics! 🌾

---

**Document Version**: 1.0  
**Last Updated**: June 2026