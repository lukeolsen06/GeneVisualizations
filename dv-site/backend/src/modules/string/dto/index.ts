/**
 * STRING Module DTOs
 * 
 * This file exports all Data Transfer Objects for the STRING module,
 * providing a centralized location for importing DTOs in other parts of the application.
 */

// Network creation and management DTOs
export { CreateNetworkDto } from './create-network.dto';
export { QueryNetworkDto } from './query-network.dto';
export { 
  NetworkResponseDto, 
  NetworkNodeDto, 
  NetworkEdgeDto 
} from './network-response.dto';

// Identifier resolution DTOs
export { 
  ResolveIdentifiersDto, 
  ResolveIdentifiersResponseDto, 
  IdentifierMappingDto 
} from './resolve-identifiers.dto';
