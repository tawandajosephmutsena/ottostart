<?php

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

trait HandlesJsonErrors
{
    /**
     * Return a JSON error response.
     */
    protected function jsonError(string $message, int $status = Response::HTTP_BAD_REQUEST, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

    /**
     * Return a JSON success response.
     */
    protected function jsonSuccess(string $message, array $data = [], int $status = Response::HTTP_OK): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if (!empty($data)) {
            $response['data'] = $data;
        }

        return response()->json($response, $status);
    }

    /**
     * Handle validation exceptions for JSON responses.
     */
    protected function handleValidationException(ValidationException $exception): JsonResponse
    {
        return $this->jsonError(
            'The given data was invalid.',
            Response::HTTP_UNPROCESSABLE_ENTITY,
            $exception->errors()
        );
    }

    /**
     * Handle authorization exceptions for JSON responses.
     */
    protected function handleAuthorizationException(): JsonResponse
    {
        return $this->jsonError(
            'You are not authorized to perform this action.',
            Response::HTTP_FORBIDDEN
        );
    }

    /**
     * Handle not found exceptions for JSON responses.
     */
    protected function handleNotFoundException(string $resource = 'Resource'): JsonResponse
    {
        return $this->jsonError(
            "{$resource} not found.",
            Response::HTTP_NOT_FOUND
        );
    }
}